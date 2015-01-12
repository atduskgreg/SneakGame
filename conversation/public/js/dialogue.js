var dialogues = [
[
"Howdy, <character2.name>.",
"How's it going, <character1.name>?",
"Can't complain. Can't complain.",
{question: true},
"Ok, well thanks.",
"No problem, take it easy."
],
[
"Hello, sir. I hope this day finds you well.",
"I am excellent, <character1.name>. Thank you.",
{question: true},
"My deepest gratitude. Did you have a question for me as well?",
{question: true},
"Good luck on this day, sir."
]
];

function populateDialogue(div, data){
	console.log("dialogue data");
	console.log(data);
	lineCount = 0;
	for(var i = 0; i < data.dialogue.length; i++){
		lineCount++;
		if(lineCount % 2){
			currentCharacter = data.character1;
			otherCharacter = data.character2;
		} else {
			currentCharacter = data.character2;
			otherCharacter = data.character1;
		}

		if(data.dialogue[i].question){
			question = data.questions[otherCharacter.name].question;
			answer = data.questions[otherCharacter.name].answer;

			div.append("<p class='question actor"+(lineCount%2 + 1)+"'> \
					   		<span class='actor'>"+currentCharacter.name+"</span> \
					   		"+ question +"\
					   	</p>\
					    <p class='response actor"+(lineCount%2 + 1)+"'> \
					   		<span class='actor'>"+otherCharacter.name+"</span> \
					   		"+ answer +"\
					    </p>");
			lineCount++;
		} else {
			div.append("<p class='actor"+(lineCount%2 + 1)+"'> \
				<span class='actor'>"+currentCharacter.name+"</span> "+renderLine(data.dialogue[i], data)+"</p>");
		}
		
	}
}

// TODO make fancier or replace with something real
function renderLine(line, data){
	return line.replace(/<character1\.name>/, data.character1.name)
	 	       .replace(/<character2\.name>/, data.character2.name);
}