import ky from 'ky';
import { API_URL } from 'shared/config';

export type Sermon = { id: number; title: string; url: string };

const getSermons = async (): Promise<Sermon[]> => {
  const sermons = await ky.get('sermons', { prefixUrl: API_URL }).json<Sermon[]>();

  return sermons;
};

export const sermons = {
  getSermons,
};
