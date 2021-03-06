(function($){

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

	$("#originList1").xListBox(createData2).xListBox("option", {
		selectable: true,
		movable: true,
		disabled: true,
		multiselect: true,
	});

	$("#originList2").xListBox(createData2).xListBox("option", {
		selectable: true,
		movable: true,
		disabled: false,
		multiselect: false,
	});

	$("#originList3").xListBox();

	$("#originList4").xListBox(createData1).xListBox("option", {
		selectable: true,
		movable: false,
		disabled: false,
		multiselect: true,
	});

	$("#originList5").xListBox(createData1).xListBox("option", {
		selectable: false,
		movable: true,
		disabled: false,
		multiselect: true,
	});

})(jQuery);