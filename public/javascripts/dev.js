/* validation for add category */

function category_validate()
{
    $(".validation_error").html('');   
    var category_name = $('#category_name').val(); 
    var flag = 1
    if (category_name == "")
    {
        add_error_div('category_name', 'Please Enter Category Name.');
         flag = 2
    }
    
      
     if (flag == 2)
    {
        return false;
    }  
    return true;
}

function instruction(){
		$(".validation_error").html('');
		var agree = $('#agree').prop('checked');
		var flag = 1;
		if(!agree){
			add_error_div('error', 'Must agree to proceed');
			flag = 2;
		}
		 if(flag == 2){
			return false;
		}
		return true;
}

/* validation for add  user details */
function user_validate()
{
		var emailRegEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
		$(".validation_error").html('');
		var username = $("#name").val();
		var fname = $("#fname").val();
		var flag = 1;
		if(username == ""){
			add_error_div('name', 'Please enter user first name');
			 flag = 2;
		}
		if(fname == ""){
			add_error_div('fname', 'Please enter user last name');
			 flag = 2;
		}
		if (!emailRegEx.test($('#email').val())){
            add_error_div('email', 'Please enter valid email');
            flag = 2;
        }
        if(($("#phonenumber").val()) == ""){
			add_error_div("phonenumber", "Please enter phone number");
			 flag = 2;
		}
		var phone_number = $("#phonenumber").val();
		var notNumber=new RegExp("[^0-9]","g");
		if((phone_number.match(notNumber))){
			add_error_div("phonenumber", "Please enter Number only");
			 flag = 2;
		}
		if(($("#password").val()) == ""){
			add_error_div("password", "Please enter password");
			flag = 2;
		}
		if(($("#confpassword").val()) == ""){
			add_error_div("confpassword", "Please enter confirm password");
			flag = 2;
		}
		if(($("#password").val()) != ($("#confpassword").val())){
			add_error_div("confpassword", "Password and confirm password not match");
			flag = 2;
		}
		var password = $("#password").val();
		if(password.length < 6){
			add_error_div("confpassword", "Password min length 6");
			flag = 2;
		}
        if(flag == 2){
			return false;
		}
		return true;
}

function profile_validate()
{		
		$(".validation_error").html('');
		var username = $("#username").val();
		var flag = 1;
		if(username == ""){
			add_error_div('username', 'Please enter user name');
			 flag = 2;
		}
		
        if(($("#phonenumber").val()) == ""){
			add_error_div("phonenumber", "Please enter phone number");
			 flag = 2;
		}
		var phone_number = $("#phonenumber").val();
		var notNumber=new RegExp("[^0-9]","g");
		if((phone_number.match(notNumber))){
			add_error_div("phonenumber", "Please enter Number only");
			 flag = 2;
		}
		
        if(flag == 2){
			return false;
		}
		return true;
}
function userRegistration_validate()
{
	var emailRegEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
		$(".validation_error").html('');
		var username = $("#username").val();
		var flag = 1;
		if(username == ""){
			add_error_div('username', 'Please enter user name');
			 flag = 2;
		}
		if (!emailRegEx.test($('#email').val())){
            add_error_div('email', 'Please enter valid email');
            flag = 2;
        }
    /*    if(($("#phonenumber").val()) == ""){
			add_error_div("phonenumber", "Please enter phone number");
			 flag = 2;
		} */
		
		if(($("#password").val()) == ""){
			add_error_div("password", "Please enter password");
			flag = 2;
		}
		if(($("#confpassword").val()) == ""){
			add_error_div("confpassword", "Please enter confirm password");
			flag = 2;
		}
		if(($("#password").val()) != ($("#confpassword").val())){
			add_error_div("confpassword", "Password and confirm password not match");
			flag = 2;
		}
		var password = $("#password").val();
		if(password.length < 6){
			add_error_div("confpassword", "Password min length 6");
			flag = 2;
		}
        if(flag == 2){
			return false;
		}
		return true;
}

function forgot_validate(){
	var emailRegEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
		$(".validation_error").html('');
		
		var flag = 1;		
		if (!emailRegEx.test($('#email').val())){
            add_error_div('email', 'Please enter valid email');
            flag = 2;
        }
         if(flag == 2){
			return false;
		}
		return true;
}

function password_validation()
{
		$(".validation_error").html('');
		if(($("#current_password").val()) == ""){
			add_error_div("current_password", "Please enter current password");
			flag = 2;
		}
		if(($("#password").val()) == ""){
			add_error_div("password", "Please enter password");
			flag = 2;
		}
		if(($("#confpassword").val()) == ""){
			add_error_div("confpassword", "Please enter confirm password");
			flag = 2;
		}
		if(($("#password").val()) != ($("#confpassword").val())){
			add_error_div("confpassword", "Password and confirm password not match");
			flag = 2;
		}
		var password = $("#password").val();
		if(password.length < 6){
			add_error_div("confpassword", "Password min length 6");
			flag = 2;
		}
        if(flag == 2){
			return false;
		}
		return true;
}

function posts_validate()
{
	$(".validation_error").html('');
	var flag = 1;
	if($("#type").val() == ''){
		add_error_div("type", "Please enter type");
		flag = 2;
	}
	if($("#title").val() == ''){
		add_error_div("title","Please enter title");
		flag = 2;
	}
	if($("#category").val()==''){
		add_error_div("category", "Please select category name");
		flag = 2;
	}
	if($("#topic").val()==''){
		add_error_div("topic", "Please select topic");
		flag = 2;
	}
	if($("#description").val()==''){
		add_error_div("description", "Please describe post");
		flag = 2;
	}
	if(flag == 2){
			return false;
	}
		return true;
}

/* Validation for Add exam question ... */

function add_question_validate()
{
	var errObj 		= {};
	errObj.count 	= 0;
	errObj.tab_1 	= tab1();
	errObj.tab_2 	= tab2();
	errObj.tab_3	= tab3();
	for(var key in errObj) {
		if(errObj[key] == false && key != 'count')
		{
			var tab = key.split('_')[1];
			$('ul.nav-tabs li').eq(--tab)
				.addClass('tab-error');
			
			errObj.count += 1;
		}else if(errObj[key] == true && key != 'count') {
			var tab = key.split('_')[1];
			$('ul.nav-tabs li').eq(--tab)
				.removeClass('tab-error');
		}
	}
	if(errObj.count == 0)
		return true;
	else
		return false;
}

function tab1()
{
	$(".validation_error").html();
	var title = $("#title").val();
	var flag;
	del_add_error_div('title','');
	if(title == ""){
		add_error_div("title","Please enter question title");
		flag = 2;
	}
	var category = $("#category").val();
	del_add_error_div('category','');
	if(category == ""){
		add_error_div("category", "Please select question category");
		flag = 2;
	}
	var topic = $("#topic").val();
	del_add_error_div('topic','');
	if(topic == ""){
		add_error_div("topic","Please select topic");
		flag = 2;
	}
	
	if(flag == 2) {
		return false;
	}
	return true;
}

function tab2()
{
	$(".validation_error").html();
	
	var claim = $("#claim").val();
	//alert(claim);
	del_add_error_div('claim','');
	var flags = 1
	var check;
	var formula_check;
	var upload_check;
	if(claim == null || claim == ''){
		add_error_div("claim","Please select question type");
		flags = 2;
	}
	if(claim=='text'){
		$('.textfields').each(function(){
			var value = $(this).val();
			if(value== ""){
				 check = 1;
			}
		});
		
	if(check ==1){
		add_error_div("text_error","Please enter question value");
		return false;
	}
	else{
		del_add_error_div("text_error","");
	}
}
if(claim=='formula'){
	var formula_value = $('.question_value').val();
	if(formula_value == undefined){
		add_error_div("formula_err","Please enter formula value");
		return false;	
	}
	$('.question_value').each(function(){
		var formula_value = $(this).val();
		if(formula_value == ""){
			formula_check = 1;
		}
	});
	if(formula_check == 1){
		del_add_error_div("formula_err","");
		add_error_div("formula_err", "Please insert formula value");
		return false;
	}
	else{
		del_add_error_div("formula_err","");
	}
	
}
if(claim=='upload'){
	var upload_value = $('.question_upload').val();
	if(upload_value == undefined){
		add_error_div("upload_err","Please enter upload value");
		return false;	
	}
	$('.question_upload').each(function(){
		var upload_value = $(this).val();
		if(upload_value == ""){
			upload_check = 1;
		}
	});
	if(upload_check == 1){
		del_add_error_div("upload_err","");
		add_error_div("upload_err", "Please insert formula value");
		return false;
	}
	else{
		del_add_error_div("upload_err","");
	}
	
}
	if(flags == 2) {
		return false;
	}
	return true;
}
function tab3()
{
	$(".validation_error").html();
	radio = document.getElementsByName('answer');
		
	for(var i=0; i<radio.length; i++){
		if(radio[i].checked == true){
			var status=1;
			break;
		}else{
			status=0;
			}
	}
	if(status==0){
			add_error_div('answer_final','Please select answer option');
			return false;
	}
	else if(radio.length == 0){
			add_error_div('answer_final','Please select answer option');
			return false;
	}
	else{
			del_add_error_div('answer_final','');
			return true;
	}
	
}

function addQuizValidation(){
	$(".validation_error").html('');
	var reg = new RegExp('^[0-9]+$');
	var flag = 1;
	if($("#quiz_name").val()== ""){
		add_error_div("quiz_name","Please insert quiz title");
		flag = 2;
	}
	if($("#no_of_questions").val() == ""){
		add_error_div("no_of_questions", "Please enter number of questions in quiz");
		flag = 2;
		}
	var question_no = $("#no_of_questions").val();
	if(reg.test(question_no) == false){
		add_error_div("no_of_questions", "Please insert only number");
		flag = 2;
	}
	if($("#time_duration").val() == ""){
		add_error_div("time_duration", "Please enter quiz time durations");
		flag = 2;
		}
	var time_duration = $("#time_duration").val();
	if(reg.test(time_duration) == false){
		add_error_div("time_duration", "Please insert only number");
		flag = 2;
	}
	var quiz_for_days = $("#quiz_for_days").val();
	if(reg.test(quiz_for_days) == false){
		add_error_div("quiz_for_days", "Please insert only number");
		flag = 2;
	}
	if($("#tag_name").val()==''){
		add_error_div("tag_name","Please insert tags name");
		flag = 2;
	}
	if($("#category").val()==''){
		add_error_div("category", "Please select category name");
		flag = 2;
	}
	if($("#topic").val()==''){
		add_error_div("topic", "Please select topic");
		flag = 2;
		}
	/*var question_no = $("#question_no").val();
	var reg = new RegExp('^[0-9]+$');
	
	if(reg.test(question_no) == false){
		add_error_div("question_no", "Please insert only number");
		flag = 2;
	}
	if($("#level").val()==''){
		add_error_div("level", "Please select question type");
		flag = 2;
	} 
	if($("#description").val() == ''){
		add_error_div("description","Please insert description");
		flag = 2;
	}*/
	if(flag == 2){
		$('.first').addClass('error');
		return false;
	}
		$('.first').removeClass('error');
		return true;
}


/*  function for display error */

function add_error_div(id, msg)
{
    $("#" + id + "_err").remove();
    $("<span id='" + id + "_err' class='validation_error'>" + msg + "</span>").insertAfter("#" + id);
    $(window).scrollTop($("#" + id + "_err").offset().top - 100)

}
function del_add_error_div(id, del)
{
    $("#" + id + "_err").remove();
    $("<span id='" + id + "_err' class='validation_error'>" + del + "</span>").insertAfter("#" + id);
    $(window).scrollTop($("#" + id + "_err").offset().top - 100)

}
