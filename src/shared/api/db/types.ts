export enum BibleBookName {
  Matthew = 'Матфея',
  Mark = 'Марка',
  Luke = 'Луки',
  John = 'Иоанна',
  Acts = 'Деяния',
  James = 'Иакова',
  FirstPeter = '1 Петра',
  SecondPeter = '2 Петра',
  FirstJohn = '1 Иоанна',
  SecondJohn = '2 Иоанна',
  ThirdJohn = '3 Иоанна',
  Judas = 'Иуды',
  Romans = 'Римлянам',
  FirstCorinthians = '1 Коринфянам',
  SecondCorinthians = '2 Коринфянам',
  Galatians = 'Галатам',
  Ephesians = 'Ефесянам',
  Philippians = 'Филиппийцам',
  Colossians = 'Колоссянам',
  FirstThessalonians = '1 Фессалоникийцам',
  SecondThessalonians = '2 Фессалоникийцам',
  FirstTimothy = '1 Тимофею',
  SecondTimothy = '2 Тимофею',
  Titus = 'Титу',
  Philemon = 'Филимону',
  Jews = 'Евреям',
  Revelation = 'Откровение',
}

export interface FetchedSermonData {
  title: string;

  bookName?: BibleBookName;

  chapter?: number;

  verse?: number | [from: number, to: number];

  description?: string;

  youtubeUrl?: string;

  audioUrl?: string;

  textFileUrl?: string;
}

export enum FetchedSermonsGroupName {
  OnBible = 'onBible',
  Topical = 'topical',
}

export interface FetchedPlaylist {
  title: string;
  list: FetchedSermonData[];
  description?: string;
  previewUrl?: string;
}

export type FetchedSermonsGroup = {
  groupName: FetchedSermonsGroupName;
  playlists: FetchedPlaylist[];
};

export interface DB {
  sermons: FetchedSermonsGroup[];
}
