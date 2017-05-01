(function($) {

var methods = {
	option: function(key, val) {
		var result = null;
		switch(getType(key)) {
			case "string":
			
				if(val !== undefined) {
					$.data(this.get(0), key, val);
					result = rerenderList(this);
				} else {
					result = $.data(this.get(0), key);
				}
				break;
			case "object":
				var data = $.data(this.get(0));
				var obj = key;
				for(var i in obj) {
					data[i] = obj[i];
				}
				$.data(this.get(0), data);
				result = rerenderList(this);
				
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
    		result = rerenderList(this, items);
    	} else {
    		var itemsArray = [];
    		this.find(".xlistbox-item").each(function(i, item) {
    			itemsArray.push($.data(item));
    		});
    		result = itemsArray;
    	}
    	return result;
    },
    getSelected: function() {
    	return this.find(".xlistbox-item").filter(function(i, item){
				return !!$.data(item, "selected");
		});
    },
    getItem: function(value) {
    	var xlistboxItems = this.find(".xlistbox-item");
    	var result = this;
    	if(typeof value == "object") {
    		value = $.data(value.get(0), "value");
    	}
    	var options = null;
		for(var i = 0; i<xlistboxItems.length; i++) {
			options = $.data(xlistboxItems.get(i));
			if(options.value == value) {
				result = options;
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
    	var xlistboxItems = this.find(".xlistbox-item");

		xlistboxItems.each(function(i, item) {
			options = $.data(item);
			if(options.value != value) return;
			for(let i in opt) {
				options[i] = opt[i];
			}
			$.data(item, options);
		});
		return rerenderList(this);
    }
};

jQuery.fn.xListBox = function(method) {
	var currentElem = this;
	if(!currentElem.hasClass("xlistbox") || !methods) {
		return currentElem;
	}

	var xlistboxItems = currentElem.find(".xlistbox-item");

	switch(getType(method)) {
		case "string":
			result = methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
			break;
		default:
			if(getType(methods)!="object") return currentElem;
			var data = method;
			if(!!data.items) {
				if(getType(data.items) != "array") throw "The data must be an array of objects";
			} else {
				data.items = [];
				currentElem.each(function(i, item) {
					$.merge(data.items, parseDataFromDOM($(item)));
				});
			}
			result = initList(data);
			break;
	}

	return result;

};

function initList(data) {
	return createList(data);
}

function parseDataFromDOM(el) {//dataOption
	var data = [];
	var listItem = el.find("li");
	var options = null;

	listItem.each(function(i, item) {
		options = $.extend({}, $.data(item));
		item = $(item);
		options["dataOptions"] = item.attr("data-options");
		options.label = item.find(".xlistbox-labeltext").html();//Можно .text(), но тогда теги не будут учитываться
		data.push(options);
	});
	/*
		Не children, потому что могут быть обертки из div, мало ли.
		Это не нарушает логику плагина
	*/
	return data;
};

function createList(data, elem) {
	var xlistboxOptions = JSON.stringify(data);
	var xlistbox = null;
	
	if(!elem) {
		xlistbox = $("<ul class='xlistbox'/>")
		.on("click", handlerClick);
	} else {
		xlistbox = elem.empty();
	}

	xlistbox.attr("data-options", xlistboxOptions);
	xlistbox.append(createElems(data));

	if(data["disabled"]) xlistbox.addClass("xlistbox-disable");
	else xlistbox.removeClass("xlistbox-disable");
	$.data(xlistbox.get(0), data);
	return xlistbox;
}


function rerenderList(elem, items) {
	/*
		На пересоздание с нуля уйдет меньше секунды при элементах = 5000
	*/
	var options = $.extend({}, $.data(elem.get(0)));
	console.log("Выше")
	if(items) {
		options.items = items;
	} else {
		options.items = parseDataFromDOM(elem, true);
	}

	return createList(options, elem);
}

function createElems(data) {

	var li = $("<li class='xlistbox-item'/>");

	var label = $("<div class='xlistbox-label'/>");

	var labelText = $("<div class='xlistbox-labeltext'/>");

	var checkbox = $("<div class='xlistbox-checkbox'>"+
			"<div class='xlistbox-flag'></div>"+
			"</div>");

	var itemDirection = $("<div class='xlistbox-direction'>"+
			"<div class='xlistbox-forward'>&#8593;</div>"+
			"<div class='xlistbox-backward'>&#8595;</div>"+
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
		//delete options.label;

		options = (options["dataOption"]) ? options["dataOption"] : JSON.stringify(options);
		
		_label = label.clone();

		_label.append(checkbox.clone())
		.append(labelText.clone().html(text))

		_li = li.clone()
		.attr("data-options", options)
		.append(_label);
		
		if(parentMovable && movable) {
			_li.append(itemDirection.clone());
		}
		
		if(disabled) {
			_li.addClass("xlistbox-disabled");
		}
		if(multiselect && selected) {
			
			_li.addClass("xlistbox-selected");

		} else if(oneSelect && selected) {
			oneSelect = false;
			_li.addClass("xlistbox-selected");
		}
		$.data(_li.get(0), items[i]);
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
	var currentItem = $(target).closest('.xlistbox-item');
	var options = $.data(currentItem.get(0)) || {};
	var parentOptions = $.data(currentItem.closest(".xlistbox").get(0)) || {};
	if(parentOptions["disabled"] || options["disabled"]) return;

	var multiselect = parentOptions["multiselect"];
	var prevItem, nextItem, itemArr;

		/*
			closest вместо hasClass, если target вложенный узел
		*/

	if(target.closest(".xlistbox-forward").length) {
			
		prevItem = currentItem.prev();

		if(!prevItem.length || !$.data(prevItem.get(0))["movable"]) return;
		prevItem.before(currentItem);
		currentItem.closest(".xlistbox").trigger("change");

	} else if(target.closest(".xlistbox-backward").length) {

		nextItem = currentItem.next();
		if(!nextItem.length || !$.data(nextItem.get(0))["movable"]) return;
		nextItem.after(currentItem);
		currentItem.closest(".xlistbox").trigger("change");

	} else if(target.closest(".xlistbox-label").length) {

		if(!parentOptions["selectable"]) return;
			/*
				Можно объединить в один if, но это лишние манипуляции с DOM
			*/

		currentCheckbox = currentItem.find(".xlistbox-checkbox");
		itemArr = currentItem.closest(".xlistbox").find(".xlistbox-item");
		if(!multiselect && itemArr.filter(".xlistbox-selected").length && !currentItem.hasClass("xlistbox-selected")) {
			return;
		}

		currentItem.toggleClass("xlistbox-selected");

		if(options["selected"]) {
			delete options["selected"];
		} else {
			options["selected"]=true;
		}
		currentItem.closest(".xlistbox").trigger("change").trigger("select");
		/*
			Мог бы обойтись без класса active,
			а использовать в CSS 3 [selected=true],
			но вам нужны пользователи со старыми браузерами 
		*/
	}
	$.data(currentItem.get(0), options)
		/*
			Могу переписать без делегирования
		*/

}

})(jQuery);

var createData1 = {
	selectable: true,
	movable: true,
	disabled: false,
	multiselect: true,
	items: [
		{
			value: "category",
			label: "Категории",
			selected: true,
			disabled: true,
			movable: true,
		},
		{
			value: "worker",
			label: "Исполнители",
			selected: false,
			movable: true,
		},
		{
			value: "element disble",
			label: "Элемент выключен",
			selected: true,
			movable: true,
		},
		{
			value: "order",
			label: "Заказы",
			selected: true,
			movable: undefined,
		}
	]
}

var createData2 = {
	selectable: true,
	movable: true,
	disabled: false,
	multiselect: true,
};

var l = $(".listbox1").xListBox(createData1);
/*
	var l = $(".listbox1, .listbox2").xListBox(createData2); - работает,
	но с createData2 нет, т.к. программные опции приоритетнее
*/
l.on("change", function(e){console.log($(this).xListBox('items'));})
.on("select", function(e){console.log("select")})
.appendTo("body");

/*
Тест option
console.log(l.xListBox("option", "disabled"));
l.xListBox("option", {"disabled": true});
console.log(l.xListBox("option", "disabled"));
l.xListBox("option", "disabled", false);
console.log(l.xListBox("option", "disabled"));
*/

/*
Тест items
var items = l.xListBox("items");//Написано, что возвращать в формате items
console.log(items);
items = items.reverse();
console.log(items);
l.xListBox("items", items);
*/

/*
Тест getSelected
console.log(l.xListBox("getSelected"));
*/

/*
Тест getItem
console.log(l.xListBox("getItem","worker"));
console.log(l.xListBox("getItem", l.find("li").eq(0)));
//$(this).find('li[name="category"]') - так по атрибуту не получится искать,
//т.к. вы сами изменли условия ТЗ на data-options="{}"
*/

/*
Тест setItem:
console.log(l.xListBox("setItem","order", {disabled: true}));
*/




