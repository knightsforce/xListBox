(function($){
	
	var originList2 = $("#originList2");
	var xlistboxList1 = originList2.clone();
	var xlistboxList2 = $("#originList1").clone();
	var xlistboxList3 = originList2.clone();
	var xlistboxList4 = originList2.clone();
	var xlistboxList5 = originList2.clone();

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
				selected: true,
				movable: true,
			},
			{
				value: "element disble",
				label: "Элемент",
				selected: false,
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

	xlistboxList1.xListBox(createData2).xListBox("option", {
		selectable: true,
		movable: false,
		disabled: false,
		multiselect: true,
	})
	.appendTo("#tb1");

	xlistboxList2.xListBox(createData1).xListBox("option", {
		selectable: true,
		movable: false,
		disabled: false,
		multiselect: true,
	})
	.appendTo("#tb2");

	xlistboxList3.xListBox(createData1).xListBox("option", {
		selectable: false,
		movable: true,
		disabled: false,
		multiselect: true,
	})
	.appendTo("#tb3");
	
	xlistboxList4.xListBox(createData1).xListBox("option", {
		selectable: true,
		movable: true,
		disabled: true,
		multiselect: true,
	})
	.appendTo("#tb4");

	xlistboxList5.xListBox(createData1).xListBox("option", {
		selectable: true,
		movable: true,
		disabled: false,
		multiselect: false,
	})
	.appendTo("#tb5");
	/*.on("change", function(e){console.log($(this).xListBox('items'));})
	.on("select", function(e){console.log("select")})
*/


})(jQuery);

/*
var items = l.xListBox("items");//Написано, что возвращать в формате items
console.log(items);
*/







/*
	var l = $(".listbox1, .listbox2").xListBox(createData2); - работает,
	но с createData2 нет, т.к. программные опции приоритетнее
*/