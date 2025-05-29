export interface SpeechTask {
  id: number;
  imageUrl: string;
  prompt: string;
  expectedWord: string;
}

// Function to get the correct image path based on environment
const getImagePath = (path: string): string => {
  // For GitHub Pages deployment, we need to prefix the repository name
  return `${process.env.PUBLIC_URL}${path}`;
};

// Sample data for the MVP with cat tasks
export const tasks: SpeechTask[] = [
  {
    id: 1,
    imageUrl: getImagePath('/images/cat.jpg'),
    prompt: 'скажи котик',
    expectedWord: 'котик'
  },
  {
    id: 2,
    imageUrl: getImagePath('/images/father.jpg'),
    prompt: 'скажи папа',
    expectedWord: 'папа'
  },
  {
    id: 3,
    imageUrl: getImagePath('/images/hedgehog.jpg'),
    prompt: 'скажи ёжик',
    expectedWord: 'ёжик'
  },
  {
    id: 4,
    imageUrl: getImagePath('/images/mother.jpg'),
    prompt: 'скажи мама',
    expectedWord: 'мама'
  },
  {
    id: 5,
    imageUrl: getImagePath('/images/tree.jpg'),
    prompt: 'скажи дерево',
    expectedWord: 'дерево'
  },
  {
    id: 6,
    imageUrl: getImagePath('/images/zebra.jpg'),
    prompt: 'скажи зебра',
    expectedWord: 'зебра'
  },
  {
    id: 7,
    imageUrl: getImagePath('/images/helicopter.jpg'),
    prompt: 'скажи вертолёт',
    expectedWord: 'вертолёт'
  },
]; 