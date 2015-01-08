function randomKnowledge(){

	whats = ["Joe", "Bob", "Jane", "Cat", "Alice", "Fin", "Mark", "the document safe", "the plans", "the exit", "the gun"];
	rooms = ["the lobby", "the driveway", "the secretary's office", "the conference room"];


	what = whats[Math.floor(Math.random() * whats.length)];


	if(Math.random() > 0.5){
		room = rooms[Math.floor(Math.random() * rooms.length)]
		where = {"name" : room};
	} else {
		col = Math.floor(Math.random() * 8);
		row = Math.floor(Math.random() * 8);
		where = {"col" : col, "row" : row};
	}


	when = Math.floor(Math.random() * 10) + 2;
	result = {"what": what, "where": where, "when": when};

	return result;
}

function squareDescription(sqr){
    return ["a", "b", "c", "d", "e", "f","g","h"][sqr.col] + (sqr.row+1);
 }

function questionAbout(thing){
	phrases = ["Do you know if <thing> is around here somewhere?",
			   "Have you seen <thing>?",
			   "Do you know where <thing> is?",
			   "Is <thing> around anywhere?"];

	phrase = phrases[Math.floor(Math.random() * phrases.length)];
	
	return phrase.replace(/<(.*)>/, thing);
}

function answerFor(what, knowledge){

	if(knowledge){
		phrases = ["Yeah sure, I saw <thing.what> at <thing.where> <thing.when> turns ago.",
				   "I think so. At least <thing.when> turns ago, <thing.what> was around <thing.where>."];	
		phrase = phrases[Math.floor(Math.random() * phrases.length)];


		console.log(knowledge);
		if(knowledge.where.col){
			where = squareDescription(knowledge.where);
		} else {
			where = knowledge.where.name;
		}

		console.log(where);
	
		return phrase.replace(/<thing\.what>/, what)
		    		 .replace(/<thing\.where>/, where)
		    		 .replace(/<thing\.when>/, knowledge.when);	
	} else {
		phrases = ["Nope, no idea.", "Sorry, no.", "Nah, sorry. No clue."];
		phrase = phrases[Math.floor(Math.random() * phrases.length)];
	}

	return phrase;
}