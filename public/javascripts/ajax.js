function changeStatus(str_id,page_val)
{
	var id = "status_"+str_id;
	$.ajax({
			type: 'post',
			url: '/admin/'+page_val+'/changestatus',
			data: {"id" :str_id,"page": page_val },
			dataType: 'json',
			success: function (data) {
				$("#"+id).html(data);	
			}
          });
}
