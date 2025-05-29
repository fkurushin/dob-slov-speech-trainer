export interface SpeechTask {
  id: number;
  imageUrl: string;
  prompt: string;
  expectedWord: string;
}

// Sample data for the MVP with cat tasks
export const tasks: SpeechTask[] = [
  {
    id: 1,
    imageUrl: '/images/cat.jpg', // These should be added to the public folder
    prompt: 'скажи котик',
    expectedWord: 'котик'
  },
  {
    id: 2,
    imageUrl: '/images/father.jpg',
    prompt: 'скажи папа',
    expectedWord: 'папа'
  },
  {
    id: 3,
    imageUrl: '/images/hedgehog.jpg',
    prompt: 'скажи ёжик',
    expectedWord: 'ёжик'
  },
  {
    id: 4,
    imageUrl: '/images/mother.jpg',
    prompt: 'скажи мама',
    expectedWord: 'мама'
  },
  {
    id: 5,
    imageUrl: '/images/tree.jpg',
    prompt: 'скажи дерево',
    expectedWord: 'дерево'
  },
  {
    id: 6,
    imageUrl: '/images/zebra.jpg',
    prompt: 'скажи зебра',
    expectedWord: 'зебра'
  },
  {
    id: 7,
    imageUrl: '/images/helicopter.jpg',
    prompt: 'скажи вертолёт',
    expectedWord: 'вертолёт'
  },
]; 