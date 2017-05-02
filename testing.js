(function($){
	var listbox1 = $("#originList");

	var xlistboxList1 = listbox1.clone();
	var xlistboxList2 = listbox1.clone();
	var xlistboxList3 = listbox1.clone();
	var xlistboxList4 = listbox1.clone();

	var arrList = [xlistboxList1, xlistboxList2, xlistboxList3, xlistboxList4];

	$("#cont1").append(xlistboxList1);
	$("#cont2").append(xlistboxList2);
	$("#cont3").append(xlistboxList3);
	$("#cont4").append(xlistboxList4);
console.log("1///", $("#cont1")[0]);
console.log("2///", xlistboxList1[0]);
console.log("3///", $("#cont1").find(".xlistbox")[0]);

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

	xlistboxList1.xListBox(createData1).xListBox("option", {
		selectable: true,
		movable: false,
		disabled: false,
		multiselect: true,
	});

	xlistboxList2.xListBox(createData1).xListBox("option", {
		selectable: false,
		movable: true,
		disabled: false,
		multiselect: true,
	});
	
	xlistboxList3.xListBox(createData1).xListBox("option", {
		selectable: true,
		movable: true,
		disabled: true,
		multiselect: true,
	});

	xlistboxList4.xListBox(createData1).xListBox("option", {
		selectable: true,
		movable: true,
		disabled: false,
		multiselect: false,
	});
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