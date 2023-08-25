import { create } from 'zustand';
import { PlaylistData } from 'widgets/playlist';
import { SermonData } from 'entities';
import { FetchedSermonsTabName, getBookLinkAsString, sermonsAPI } from 'shared';

interface TopicalListState {
  topicalList: PlaylistData[];
  getTopicalList: () => Promise<PlaylistData[]>;
}

export const useTopicalListStore = create<TopicalListState>((set) => ({
  topicalList: [],
  getTopicalList: async () => {
    const response = await sermonsAPI.getSermonsTabContent(FetchedSermonsTabName.Topical);

    const booksList = response?.playlists ?? [];

    const mappedBookList = booksList.map<PlaylistData>((playlist) => {
      const mappedList = playlist.list.map<SermonData>((el) => ({
        title: getBookLinkAsString({
          title: el.title,
          verse: el.verse,
          chapter: el.chapter,
        }),
        description: el.description,
        fragments: el.fragments.map((fragment) => ({
          audioUrl: fragment.audioUrl,
          description: fragment.description,
          textFileUrl: fragment.textFileUrl,
          title: fragment.title
            ? getBookLinkAsString({
                title: fragment.title,
                verse: fragment.verse,
                chapter: fragment.chapter,
              })
            : undefined,
          youtubeUrl: fragment.youtubeUrl,
        })),
      }));

      return {
        ...playlist,
        list: mappedList,
      };
    });

    set((state) => ({
      ...state,
      topicalList: mappedBookList,
    }));

    return mappedBookList;
  },
}));
