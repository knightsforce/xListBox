(function($) {
jQuery.fn.xListBox = function(data) {

	var currentElem = this;
	if(!currentElem.hasClass("xlistbox") || !data) {
		return currentElem;
	}

	var xlistboxItems = currentElem.find(".xlistbox-item");


	var type = getType(data);
	if(type == "string") {
		var countArgs = arguments.length;
		var arg1 = arguments[0];
		var arg2 = arguments[1];
		var arg3 = arguments[2];
		switch(data) {
			case "option":
				if(countArgs==2) {
					if(getType(arg2) == "string") {	

						result = JSON.parse(currentElem.attr("data-options"))[arg2];
					} else {

						var options = JSON.parse(currentElem.attr("data-options"));
						for(var i in arg2) {
							options[i] = arg2[i];
						}
						currentElem.attr("data-options", JSON.stringify(options));
						result = rerenderList(currentElem);
					}

				} else if(countArgs==3) {
					var options = JSON.parse(currentElem.attr("data-options"));
					options[arg2]=arg3;
					currentElem.attr("data-options", JSON.stringify(options));
					result=rerenderList(currentElem);
				} else {
					result=currentElem;
				}
				break;

			case "items":
				if(countArgs==1) {
					result = parseDataFromDOM(currentElem);
				} else if(countArgs==2) {
					result = rerenderList(currentElem, arg2);
				}
				else {
					result=currentElem;
				}
				break;

			case "getSelected":
				result = xlistboxItems.filter(function(i, item){
					return !!JSON.parse(item.getAttribute("data-options"))["selected"];
				});
				break;

			case "getItem":
				if(countArgs==2) {
					
					if(typeof arg2 == "object") {
						arg2 = JSON.parse(arg2.attr("data-options"))["value"];

					}

					var options = null;
					for(var i = 0; i<xlistboxItems.length; i++) {
						options = JSON.parse(xlistboxItems.eq(i).attr("data-options"));
						if(options.value == arg2) {
							result = options;
							break;
						}
					}
				} else {
					result=currentElem;
				}
				break;

			case "setItem":
				if(countArgs==3) {
					var options = null;
					xlistboxItems.each(function(i, item) {
						options = JSON.parse(item.getAttribute("data-options"));
						if(options.value != arg2) return;
						for(let i in arg3) {
							options[i] = arg3[i];
						}
						item.setAttribute("data-options", JSON.stringify(options));
					});
					result=rerenderList(currentElem);

				} else {
					result=currentElem;
				}
				break;
			currentElem.trigger("change");
		}
	} else if(type == "object") {
		if(!!data.items) {
			if(getType(data.items) != "array") throw "The data must be an array of objects";
		} else {
			data.items = parseDataFromDOM(currentElem);
		}
			
			/*
				Чтобы на выходе всегда был обхект одного типа
				Массив объектов
			*/

		result = createList(data);
	}

	return result;
};



function parseDataFromDOM(el) {

	var data = [];
	var listItem = el.find("li");
	var options = null;

	listItem.each(function(i, item) {
		item = $(item);
		options = item.attr("data-options");
		if(!options) return;
		options = JSON.parse(options);
		options.label = item.find(".xlistbox-labeltext").html();//Можно .text(), но тогда теги не будут учитываться
		data.push(options);
	});
	/*
		Не children, потому что могут быть обертки из div, мало ли.
		Это не нарушает логику плагина
	*/
	return data;
};

function createList(data) {
	var xlistboxOptions = JSON.stringify({
		movable: !!data["movable"],
		disabled: !!data["disabled"],
		selectable: !!data["selectable"],
		multiselect: !!data["multiselect"],
	});

	var xlistbox = $("<ul class='xlistbox'/>")
	.attr("data-options", xlistboxOptions)
	.on("click", handlerClick);
	xlistbox.append(createElems(data));
	if(data["disabled"]) xlistbox.addClass("xlistbox-disable");
	return xlistbox;
}

function rerenderList(elem, items) {
	/*
		На пересоздание с нуля уйдет меньше секунды при элементах = 5000
	*/
	var options = JSON.parse(elem.attr("data-options"));
	if(items) {
		options.items = items;
	} else {
		options.items = parseDataFromDOM(elem);
	}
	var parent = elem.parent();
	elem.remove();
	return parent.append(createList(options));
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
		delete options.label;

		options = JSON.stringify(options);
		
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
			
			_li.addClass("xlistbox-active");

		} else if(oneSelect && selected) {
			oneSelect = false;
			_li.addClass("xlistbox-active");
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
	var currentItem = $(target).closest('.xlistbox-item');
	var options = JSON.parse((currentItem.attr("data-options") || "{}"));
	var parentOptions = JSON.parse((currentItem.closest(".xlistbox").attr("data-options") || "{}"));
	if(parentOptions["disabled"] || options["disabled"]) return;

	var multiselect = parentOptions["multiselect"];
	var prevItem, nextItem, itemArr;

		/*
			closest вместо hasClass, если target вложенный узел
		*/

	if(target.closest(".xlistbox-forward").length) {
			
		prevItem = currentItem.prev();
		if(!prevItem.length || !JSON.parse(prevItem.attr("data-options"))["movable"]) return;
		prevItem.before(currentItem);
		currentItem.closest(".xlistbox").trigger("change");

	} else if(target.closest(".xlistbox-backward").length) {

		nextItem = currentItem.next();
		if(!nextItem.length || !JSON.parse(nextItem.attr("data-options"))["movable"]) return;
		nextItem.after(currentItem);
		currentItem.closest(".xlistbox").trigger("change");

	} else if(target.closest(".xlistbox-label").length) {

		if(!parentOptions["selectable"]) return;
			/*
				Можно объединить в один if, но это лишние манипуляции с DOM
			*/

		currentCheckbox = currentItem.find(".xlistbox-checkbox");
		itemArr = currentItem.closest(".xlistbox").find(".xlistbox-item");
		if(!multiselect && itemArr.filter(".xlistbox-active").length && !currentItem.hasClass("xlistbox-active")) {
			return;
		}

		currentItem.toggleClass("xlistbox-active");

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
	currentItem.attr("data-options", JSON.stringify(options));
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
l.on("change", function(e){console.log("change")})
.on("change", function(e){
	//console.log($(this).find(".xListBox-labeltext").text(), JSON.parse($(this).attr("data-options")));
})
.on("select", function(e){console.log("select")})
.appendTo("body");

/*
Тест option
var items = console.log(l.xListBox("option", "disabled"));
var items = l.xListBox("option", {"disabled": true});
var items = console.log(l.xListBox("option", "disabled"));
var items = l.xListBox("option", "disabled", false);
var items = console.log(l.xListBox("option", "disabled"));
*/

/*
Тест items
var items = l.xListBox("items");
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




