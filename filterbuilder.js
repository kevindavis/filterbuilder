var template;

// Conditions vary by type
// number: is, is not, greater than, less than, between
// date: before, after, between
// string: contains, doesn't contain, is, is not
var comparators = {
	"Number" : 
		[{"Comparator": "is",
			"ArgumentCount" : 1,
			"ArgumentDefaults" : [] },
		 {"Comparator" : "is not",
			"ArgumentCount" : 1,
			"ArgumentDefaults" : [] },
		 {"Comparator" : "greater than",
			"ArgumentCount" : 1,
			"ArgumentDefaults" : [] },ß
		 {"Comparator" : "less than",
			"ArgumentCount" : 1,
			"ArgumentDefaults" : [] },
		 {"Comparator" : "between",
			"ArgumentCount" : 2,
			"ArgumentDefaults" : [] }
		 ],
		
	"Date" : 
		[{"Comparator": "is",
			"ArgumentCount" : 1,
			"ArgumentDefaults" : [] },
		 {"Comparator" : "is not",
			"ArgumentCount" : 1,
			"ArgumentDefaults" : [] }
		],
		
	"String" : 
		[{"Comparator": "is",
			"ArgumentCount" : 1,
			"ArgumentDefaults" : [] },
		 {"Comparator" : "is not",
			"ArgumentCount" : 1,
			"ArgumentDefaults" : [] }
		]
};

function setup(fields){

	// create a template that looks like:
	// <div class="clause">
	// 	<select class="fields">
	// 		<option value="FieldType1">FieldName1</option>
	// 		<option value="FieldType2">FieldName2</option>
	// 	</select>
	//  <select class="comparators"></select>
	// 	<span class="conditions"></span>
	// 	<button class="remove-clause">remove</button>
	// </div>
	template = $("<div/>", { class: "clause" } );
	var dropdown = $("<select/>", { class: "fields"});
	for(var i in fields)
	{
		$("<option/>")
			.attr("value", fields[i].FieldType)
			.text(fields[i].FieldName)
			.appendTo(dropdown);
	}
	dropdown.change(function(){
		adjustField($(this).parent(), $(this).val());
	});
	dropdown.appendTo(template);
	var comparators = $("<select/>", { class: "comparators"})
	comparators.change(function(){
			adjustComparator($(this).parent(), $(this).val());
		})
	comparators.appendTo(template);
	$("<span/>", { class: "conditions"})
		.appendTo(template);
	$("<button/>")
		.text("remove")
		.click(function(){
			$(this).parent().remove();
		})
		.appendTo(template);

	adjustField(template, fields[0].FieldType);
	
	template.clone(true).appendTo('#clauses');
				
	// hydrate the existing clauses
	for(var i in existing_clauses)
	{
		addClause(existing_clauses[i]);
	}
}

function addClause(clause){
	if(clause){
		
	} else {
		template.clone(true).appendTo('#clauses');
	}
}
		
// change the condition UI to fit the selected field
// expects: clause: a jquery object representing a clause div
// 					fieldtype: a type of field.. surprise!
function adjustField(clause, fieldtype){
	// clear the options from the .comparators select
	var dropdown = $(clause).find(".comparators");
	dropdown.find("option").remove();

	// fill in the new options
	for (var i in comparators[fieldtype])
	{
		$("<option/>")
			.text(comparators[fieldtype][i].Comparator)
			.appendTo(dropdown);
	}
	adjustComparator(clause,comparators[fieldtype][0]);
}

// change the parameters UI to fit the condition specified
// expects: clause: a jquery object representint a clause div
// 					comparator: a comparator (string OR object) eg. "is", "greater than" etc
function adjustComparator(clause, comparator){
	// clear the previous conditions
	var conditions = clause.find(".conditions");
	conditions.find("*").remove();
	
	// form the comparator object out of a string
	if(typeof(comparator) == 'string'){		
		var fieldtype = clause.find(".fields").val();
		for (var i in comparators[fieldtype]){
			if (comparators[fieldtype][i].Comparator == comparator){
				comparator = comparators[fieldtype][i];
			}
		}
	}
	
	// switch on number of arguments
	switch(comparator.ArgumentCount)
	{
		case 1:
			// add textbox to .conditions <span>
			$("<input/>")
				.val(comparator.ArgumentDefaults[0])
				.attr("type","text")
				.appendTo(conditions);
			break;
		case 2:
			// add a textbox, then a span, then another textbox 
			$("<input/>")
				.val(comparator.ArgumentDefaults[0])
				.attr("type","text")
				.appendTo(conditions);
			$("<span/>")
				.text("and")
				.appendTo(conditions);
			$("<input/>")
				.val(comparator.ArgumentDefaults[0])
				.attr("type","text")
				.appendTo(conditions);
			break;
	}
}
