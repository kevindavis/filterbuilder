== What is this thing? ==

Filter Builder is some javascript UI for building up a filter in a data driven application. You've used something similar if you've built a smart playlist in iTunes.

== How do I use it? == 

*Short version* : check out the example

*Long version* 

Call the setup function with an array that looks like :

var fields = [
	{
		"FieldName": "Title",
		"FieldType": "String"
	}
	...
	]
	
Valid values for FieldType are 'String', 'Date' and 'Number' (for now..).
	
Also, you have to structure your markup just so (see the example). I'll adjust this eventually.

== What can this thing filter? ==

Erm.. nothing really. This UI will spit out a JSON representation of a filter that you'd then have to interpret. If I get ambitious maybe I'll post a server side piece for Rails.

== Are there any dependencies? ==

JQuery, but you're using that anyways.

== Can I help? == 

Of course! I started this on the labour day long weekend and doubt I'll have much time to do much work on it.