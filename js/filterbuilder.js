$(function(){

	var Field = Backbone.Model.extend({
		VALID_FIELD_TYPES: ['string', 'date', 'number'],

		defaults: function(){
			return {
				fieldType: 'string'
			};
		},

		validation: {
			fieldType: { oneOf: this.VALID_FIELD_TYPES }
		}
	});

	var Clause = Backbone.Model.extend({
		COMPARATORS: {
			string: ['is', 'is not', 'contains'],
			date: 	['is', 'is not', 'between', 'before', 'after'],
			number: ['is', 'is not', 'between', 'less than', 'greater than']
		},
		
		defaults: function(){
			return {
				field: fields.at(0), 
				comparator: 'is',
				values: []
			};
		},

		validate: function(attrs, options){
			// validate value counts for comparator
			if(attrs.comparator == 'between'){
				if(attrs.values.length != 2){
					return "Invalid number of values for " + attrs.comparator;
				}
			} else {
				if(attrs.values.length != 1){
					return "Invalid number of values for " + attrs.comparator;
				}
			}

			// validate comparator works for field type
			if(! _.contains(this.COMPARATORS[attrs.field.attributes.fieldType], attrs.comparator)){
				return 'Invalid comparator for ' + attrs.field.attributes.fieldType;
			}

			// validate that the field is a valid field
			if(! _.contains(fields, attrs.fields)) {
				return "Invalid field";
			}
		}

		// TODO: check whether these things are valid before use
		// http://www.sagarganatra.com/2012/10/backbonejs-model-validation-in.html
	});

	var FieldList = Backbone.Collection.extend({
		model: Field
	});
	var ClauseList = Backbone.Collection.extend({
		model: Clause,
		// local storage to make this easily demoable
		localStorage: new Backbone.LocalStorage("clauses-backbone")
	});

	var fields = new FieldList;
	var clauses = new ClauseList;


	var ClauseView = Backbone.View.extend({
		tagName: 'li',

		template: _.template($('#clause-template').html()),

		events: {
			"click a.destroy" : "clear",
			"change .clause-field" : "changeField",
			"change .clause-comparator" : "changeComparator",
			"change input" : "changeValue"
		},


		initialize: function(){
			this.listenTo(this.model, 'change', this.render);
			this.listenTo(this.model, 'destroy', this.remove);
		},

		render: function(){
			this.$el.html(this.template({
				field: this.model.get('field').toJSON(),
				comparator: this.model.get('comparator'),
				values: this.model.get('values'),
				fields: fields.toJSON(),
				COMPARATORS: this.model.COMPARATORS
			}));
			return this;
		},

		clear: function(){
			this.model.destroy();
		}, 

		changeField: function(){
			// change the field object to the appropriate one
			var new_field = fields.findWhere({fieldName: this.$el.children('.clause-field').val() });
			this.model.set({'field': new_field});

			// change the comparator
			var new_comparator = _.first(this.model.COMPARATORS[new_field.get('fieldType')]);
			this.model.set({'comparator': new_comparator});

			this.render();
		},

		changeComparator: function(){
			this.model.set({'comparator': this.$el.children('.clause-comparator').val()});
			// when switching to a between comparator, dupe the value into the 2nd parameter
			if(this.model.get('comparator') == 'between'){
				var old_value = this.model.get('values')[0]; 
				this.model.set({'values': [old_value, old_value]});
			}
			this.render();
		},

		changeValue: function(){
			var new_vals = [];
			this.$el.children('input').each(function(){
				new_vals.push($(this).val());
			});
			this.model.set({'values': new_vals});
		}
	});

	var AppView = Backbone.View.extend({
		el: $("#filterbuilder"),

		initialize: function(element){
			// populate the Fields, Clauses collections from passed params
			_.each(this.options.json_fields, function(element){
				var f = new Field(element);
				if(f.isValid()){
					fields.add(f);
				}
			});
			_.each(this.options.json_clauses, function(element){
				var c = new Clause();
				c.set({
					field: fields.findWhere({ fieldName: element.fieldName }), 
					comparator: element.comparator,
					values: element.values 
				});

				if(c.isValid()){
					clauses.add(c);				
				}

				var vc = new ClauseView({model: c});
				this.$('#clauses').append(vc.render().el);
			});
		}, 

		events: {
			"click #clause-add": "addClause"
		},

		addClause: function(){
			c = clauses.create(new Clause);
			var vc = new ClauseView({model: c});
			this.$('#clauses').append(vc.render().el);
		}
	});

	var App = new AppView({json_fields:json_fields, json_clauses:json_clauses});
});