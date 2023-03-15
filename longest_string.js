const stri = ('This a beautiful day');

const longestWord = (stri)=>
{
	const striArray = stri.split('');
	const sortedStriArray = striArray.sort
	(
		(striA, striB)=>
		{
			return striB.length - striA.length;
		}
	)
	return sortedStriArray[0];
}

console.log(longestWord(stri)); 