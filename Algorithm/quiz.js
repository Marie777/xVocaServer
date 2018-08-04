
const quizGenerator = (allWords) => {
  const arrWords = Object.keys(allWords);
  const wordsWithDefinition = arrWords.filter(key => allWords[key][0].definition !== "");

  return wordsWithDefinition.reduce((acc, currentItem) => {
        acc.push({
          question : allWords[currentItem][0].definition,
          answer1 : currentItem,
          answer2 : arrWords[randomNumberFunc(arrWords.length)],
          answer3 : arrWords[randomNumberFunc(arrWords.length)],
          answer4 : arrWords[randomNumberFunc(arrWords.length)]
        });
    return acc;
  }, []);
};



const randomNumberFunc = (size) => {
  return Math.floor((Math.random() * size) + 1);
};



export {quizGenerator};
