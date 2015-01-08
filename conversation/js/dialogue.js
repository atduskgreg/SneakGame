var dialogue = ["Howdy, <character2.name>.",
				"How's it going, <character1.name>?",
				"Can't complain. Can't complain.",
				{question: true},
				"Ok, well thanks.",
				"No problem, take it easy."];

function populateDialogue(div, dialogue, character1, character2){
	renderData = {character1:character1, character2:character2};
	lineCount = 0;
	for(var i = 0; i < dialogue.length; i++){
		lineCount++;
		if(lineCount % 2){
			currentCharacter = character1;
			otherCharacter = character2;
		} else {
			currentCharacter = character2;
			otherCharacter = character1;
		}

		if(dialogue[i].question){
			div.append("<p class='question actor"+(lineCount%2 + 1)+"'> \
					   		<span class='actor'>"+currentCharacter.name+"</span>\
					   	</p>\
					    <p class='response actor"+(lineCount%2 + 1)+"'> \
					   		<span class='actor'>"+otherCharacter.name+"</span>\
					    </p>");
			lineCount++;
		} else {
			div.append("<p class='actor"+(lineCount%2 + 1)+"'> \
				<span class='actor'>"+currentCharacter.name+"</span> "+renderLine(dialogue[i], renderData)+"</p>");
		}
		
	}
}

// TODO make fancier or replace with something real
function renderLine(line, data){
	return line.replace(/<character1\.name>/, data.character1.name)
	 	       .replace(/<character2\.name>/, data.character2.name);
}