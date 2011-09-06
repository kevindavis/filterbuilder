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
				"ArgumentDefaults" : [] },
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
			"ArgumentDefaults" : [] },
		 {"Comparator" : "before",
			"ArgumentCount" : 1,
			"ArgumentDefaults" : [] },
		 {"Comparator" : "after",
			"ArgumentCount" : 1,
			"ArgumentDefaults" : [] },
			{"Comparator" : "between",
			"ArgumentCount" : 2,
			"ArgumentDefaults" : [] }
		],
		
	"String" : 
		[{"Comparator": "is",
			"ArgumentCount" : 1,
			"ArgumentDefaults" : [] },
		 {"Comparator" : "is not",
			"ArgumentCount" : 1,
			"ArgumentDefaults" : [] },
		 {"Comparator" : "contains",
			"ArgumentCount" : 1,
			"ArgumentDefaults" : [] },
		 {"Comparator" : "does not contain",
			"ArgumentCount" : 1,
			"ArgumentDefaults" : [] },
		 {"Comparator" : "begins with",
			"ArgumentCount" : 1,
			"ArgumentDefaults" : [] },
		 {"Comparator" : "ends with",
			"ArgumentCount" : 1,
			"ArgumentDefaults" : [] }
		]
};

function setup(fields, existing_clauses){

	// create a template that looks like:
	// <div class="clause">
	// 	<select class="fields">
	// 		<option data-fieldtype="FieldType1">FieldName1</option>
	// 		<option data-fieldtype="FieldType2">FieldName2</option>
	// 	</select>
	//  <select class="comparators"></select>
	// 	<span class="conditions"></span>
	// 	<button class="remove-clause">remove</button>
	// </div>
	template = $("<div/>", { class: "clause" } );
	var fields_dropdown = $("<select/>", { class: "fields"});
	for(var i in fields)
	{
		$("<option/>")
			.attr("data-fieldtype", fields[i].FieldType)
			.text(fields[i].FieldName)
				.appendTo(fields_dropdown);
	}
	fields_dropdown.change(function(){
		adjustField($(this).parent(), $(this).find('option:selected').attr('data-fieldtype'));
	});
	fields_dropdown.appendTo(template);
	var comparators_dropdown = $("<select/>", { class: "comparators"})
	comparators_dropdown.change(function(){
			adjustComparator($(this).parent(), $(this).val());
		})
		comparators_dropdown.appendTo(template);
	$("<span/>", { class: "conditions"})
		.appendTo(template);
	$("<button/>")
		.text("remove")
		.click(function(){
			$(this).parent().remove();
		})
		.appendTo(template);

	adjustField(template, fields[0].FieldType);
	
	if(existing_clauses.size == 0){
		template.clone(true).appendTo('#clauses');
	}
				
	// hydrate the existing clauses
	for(var i in existing_clauses)
	{
		addClause(existing_clauses[i]);
	}
}

function addClause(clause){
	
	var new_clause = template.clone(true);
	
	if(clause){
		
		// Expects a clause that looks like:
		// {
		// 	"FieldName" : "Title",
		// 	"Condition" : {
		// 		"Comparator" : "is",
		// 		"Arguments" : ["1984"]
		// 	}
		// },

		// set the field
		new_clause.find('.fields').val(clause.FieldName);
		adjustField(new_clause, $('.fields option:selected', new_clause).attr('data-fieldtype'));
		
		// set the comparator
		new_clause.find('.comparators').val(clause.Condition.Comparator);
		adjustComparator(new_clause, clause.Condition.Comparator);
		
		// fill in the arguments
		var inputs = new_clause.find('.conditions input');
		if(clause.Condition.Arguments.length == 1){
			inputs.val(clause.Condition.Arguments[0]);
		} else {
			for (var i in clause.Condition.Arguments){
				inputs[i].value = clause.Condition.Arguments[i];
			}			
			
		}
	}
	
	new_clause.appendTo('#clauses');
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
		var fieldtype = clause.find(".fields option:selected").attr('data-fieldtype');
		for (var i in comparators[fieldtype]){
			if (comparators[fieldtype][i].Comparator == comparator){
				comparator = comparators[fieldtype][i];
			}
		}
	}
	
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
