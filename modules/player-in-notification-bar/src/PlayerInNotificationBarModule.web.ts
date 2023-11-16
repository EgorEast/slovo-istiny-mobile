import { EventEmitter } from 'expo-modules-core';

const emitter = new EventEmitter({} as never);

export default {
  PI: Math.PI,
  hello: () => 'Hello world! 👋',
  async setValueAsync(value: string): Promise<void> {
    emitter.emit('onChange', { value });
  },
};
