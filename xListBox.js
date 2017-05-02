(function($) {
var methods = {
	option: function(key, val) {
		var result = null;
		switch(getType(key)) {
			case "string":
			
				if(val !== undefined) {
					this.data(key, val);
					result = rerenderList(this, {save: true});
				} else {
					result = this.data(key);
				}
				break;
			case "object":

				var data = this.data();
				var obj = key;
				for(var i in obj) {
					data[i] = obj[i];
				}
				this.data(data);
				result = rerenderList(this, {save: true});
				
				break;
			default:
				result = this;
				break;
		}
		return result;
    },
    items: function(items) {
    	var result = null; 
    	if(getType(items) == "array") {
    		result = rerenderList(this, {items: items});
    	} else {
    		result = this.data().items;
    	}
    	return result;
    },
    getSelected: function() {

    	var itemsArr = this.data().items;
    	return this.find(".xlistbox-item").filter(function(i, item){
				return !!itemsArr[i]["selected"];
		});
    },
    getItem: function(value) {
    	var itemsArr = this.data().items;
    	var result = this;
    	if(typeof value == "object") {
    		value = value.data("value")
    	}
    	var options = null;
		for(var i = 0; i<itemsArr.length; i++) {
			if(itemsArr[i]["value"] == value) {
				result = itemsArr[i];
				break;
			}
		}
		return result;
    },
    setItem: function(value, opt) {
    	if(!value || getType(value) != "string") {
    		return this;
    	}

    	var options = null;
    	var data = this.data();
    	var itemsArr = data.items;

    	for(var i = 0; i<itemsArr.length; i++) {
    		options = itemsArr[i];
    		if(options.value != value) continue;

    		for(let key in opt) {
				options[key] = opt[key];
			}
    	}
    	data.items=itemsArr;
    	this.data(data);

		return rerenderList(this);
    }
};

jQuery.fn.xListBox = function(method) {
	var currentElem = this;
	if(currentElem.get(0).tagName != "UL" || !methods) {
		return currentElem;
	}
	var xlistboxItems = currentElem.find("li");

	switch(getType(method)) {
		case "string":
			result = methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
			break;
		default:
			if(getType(methods)!="object") return currentElem;
			var data = this.data();
			data = $.extend(getOptionsFromDOM(this), data, method);
			if(!!data.items) {
				data.saveDOM = false;
				if(getType(data.items) != "array") throw "The data must be an array of objects";
			} else {
				data.items = [];
				data.saveDOM = true;
				currentElem.each(function(i, item) {
					$.merge(data.items, parseDataFromDOM($(item)));
				});

			}

			result = initList(data, this);
			this.on("click.xlistbox", handlerClick);
			break;
	}

	return result;

};

function initList(data, elem) {
	return createList(data, elem);
}

function getOptionsFromDOM(elem) {
	var dataOptions = elem.attr("data-options") || "{}";
	dataOptions = JSON.parse(dataOptions);

	(typeof dataOptions.selectable !== "boolean") && (dataOptions.selectable = elem.attr("selectable"));
	(typeof dataOptions.movable !== "boolean") && (dataOptions.movable = elem.attr("movable"));
	(typeof dataOptions.disabled !== "boolean") && (dataOptions.disabled = elem.attr("disabled"));
	(typeof dataOptions.multiselect !== "boolean") && (dataOptions.multiselect = elem.attr("multiselect"));

	return dataOptions;
}

function parseDataFromDOM(el) {//dataOption
	var data = [];
	var listItem = el.find("li");
	var itemsArray = el.data().items;
	var options = null;

	listItem.each(function(i, item) {
		options = {};
		if(itemsArray) $.extend(options, itemsArray[i]);
		item = $(item);
		options["liElem"] = item;

		options["dataOptions"] = item.attr("data-options") || {};

		(typeof options.selected !== "boolean") && (options.selected = (item.attr("selected") || false));
		(typeof options.disabled !== "boolean") && (options.disabled = (item.attr("disabled") || false));
		(typeof options.movable !== "boolean") && (options.movable = (item.attr("movable") || false));
		options.label = (options["dataOptions"].label || item.find(".xlistbox-item-labeltext").text() || item.text());
		data.push(options);
	});
	return data;
};

function createList(data, elem) {

	var xlistbox = null;
	if(!elem) {
		xlistbox = $("<ul class='xlistbox'/>")
		.on("click", handlerClick);
	} else {
		xlistbox = elem;
		if(!data["saveDOM"]) {
			xlistbox.empty();
			delete data["saveDOM"];
		}
	}

	if(!data.multiselect) {
		var itemsArray = data.items;
		var oneSelect = false;
		for(var i = 0; i<itemsArray.length; i++) {
			if(!oneSelect && itemsArray[i]["selected"]) {
				oneSelect=true;
				continue;
			}
			oneSelect && (itemsArray[i]["selected"]=false);
		}
	}

	xlistbox.append(createElems(data));

	if(data["disabled"]) xlistbox.addClass("xlistbox-disabled");
	else xlistbox.removeClass("xlistbox-item-disabled");
	xlistbox.removeAttr("data-options").data(data);
	return xlistbox;
}


function rerenderList(elem, opt) {
	opt = opt || {};
	//{"save": true, items: items}
	/*
		На пересоздание с нуля уйдет меньше секунды при элементах = 5000
	*/
	var data = $.extend({}, $(elem).data());
	
	data.saveDOM = false;

	if(opt.items) {
		data.items = items;
	} else if(opt.save) {
		data.items = parseDataFromDOM(elem);
		data.saveDOM = true;
	}
	
	return createList(data, elem);
}

function createElems(data) {

	var li = $("<li class='xlistbox-item'/>");

	var label = $("<div class='xlistbox-item-label'/>");

	var labelText = $("<div class='xlistbox-item-labeltext'/>");

	var checkbox = $("<div class='xlistbox-item-checkbox'>"+
			"<div class='xlistbox-item-flag'></div>"+
			"</div>");

	var itemDirection = $("<div class='xlistbox-item-direction'>"+
			"<div class='xlistbox-item-forward'>&#8593;</div>"+
			"<div class='xlistbox-item-backward'>&#8595;</div>"+
			"</div>");

	var arrList=[];
	var options = null;
	var disabled = false;
	var selected = false;
	var oneSelect = true;
	var multiselect = data["multiselect"];
	var parentMovable = data["movable"];
	var movable = null;
	var text = null;
	var _li, _label;

	var items = data.items;
	for(var i = 0; i < items.length; i++) {
		options = items[i];
		disabled = options.disabled;
		selected = options.selected;
		movable = options.movable;

		text = options.label || "";
		
		_label = label.clone();

		_label.append(checkbox.clone())
		.append(labelText.clone().text(text))

		_li = (options["liElem"]) ? options["liElem"].empty().removeAttr("data-options").addClass("xlistbox-item") : li.clone();
		delete options["liElem"];
		_li.append(_label);

		if(parentMovable && movable) {
			_li.append(itemDirection.clone());
		}
		
		if(disabled) {
			_li.addClass("xlistbox-item-disabled");
		} else {
			_li.removeClass("xlistbox-item-disabled");
		}
		

		if(multiselect && selected) {
			
			_li.addClass("xlistbox-item-selected");

		} else if(oneSelect && selected) {
			oneSelect = false;
			_li.addClass("xlistbox-item-selected");
		} else {
			_li.removeClass("xlistbox-item-selected");
		}

		arrList.push(_li);
	}
	return arrList;
}

function getType(obj) {
	var type = Object.prototype.toString.call(obj)
	return type.slice(8, type.length-1).toLowerCase();
}

function handlerClick(e) {
	var target = $(e.target);

	var currentItem = $(target).closest(".xlistbox-item");
	var parentList = currentItem.closest(".xlistbox");

	var parentOptions = parentList.data();

	var allItems = parentList.find(".xlistbox-item");
	var itemsArray = parentOptions.items;
	var index = allItems.index(currentItem);
	var currEl = itemsArray[index];
	
	if(parentOptions["disabled"] || currEl.disabled) return;

	
	var multiselect = parentOptions["multiselect"];
	var prevItem, nextItem, itemArr;
		/*
			closest вместо hasClass, если target вложенный узел
		*/

	if(target.closest(".xlistbox-item-forward").length) {

		prevItem = currentItem.prev();
		var prevEl = itemsArray[index-1];

		if(!prevItem.length || !prevEl["movable"]) return;
		prevItem.before(currentItem);
		currentItem.closest(".xlistbox").trigger("change");

		itemsArray[index-1] = currEl;
		itemsArray[index] = prevEl;

	} else if(target.closest(".xlistbox-item-backward").length) {

		nextItem = currentItem.next();
		var nextEl = itemsArray[index+1];

		if(!nextItem.length || !nextEl["movable"]) return;
		nextItem.after(currentItem);
		currentItem.closest(".xlistbox").trigger("change");

		itemsArray[index] = nextEl;
		itemsArray[index+1] = currEl;

	} else if(target.closest(".xlistbox-item-label").length) {

		if(!parentOptions["selectable"]) return;
			/*
				Можно объединить в один if, но это лишние манипуляции с DOM
			*/
		var itemsSelected = allItems.filter(".xlistbox-item-selected");

		if(!multiselect) {
			var currentElemDOM = currentItem.get(0);
			itemsSelected.filter(function(i, item) {
				if(item==currentElemDOM) return false;
				return true;
			})
			.removeClass("xlistbox-item-selected");
			for(var i = 0; i<itemsArray.length; i++) {
				itemsArray[i]["selected"]=false;
			}

		}

		currentItem.toggleClass("xlistbox-item-selected");

		if(currEl.selected) {
			itemsArray[index]["selected"]=false;
		} else {
			itemsArray[index]["selected"]=true;
		}
		currentItem.closest(".xlistbox").trigger("change").trigger("select");
	}
	parentOptions.items = itemsArray;
	parentList.data(parentOptions);
}

})(jQuery);//