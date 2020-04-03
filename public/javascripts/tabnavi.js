$(function () { 
    //Get the first tab in document and will assume will always use first one
    var selectedTab = $(document).find('div[class^="ui-tabs"]').first();
 
    //Navigation button, select tab when button click.
    $(".Footer").on('click', ':button', function () {
        var selected = selectedTab.tabs("option", "active");
        if (this.id == "btnMoveLeftTab") {
            if (selected >= 1) {
                selectedTab.tabs("option", "active", selected - 1);
            }
        } else {
            selectedTab.tabs("option", "active", selected + 1);
        }
    });
 
    //Tab activated, only display next on first tab, and previous in last tab
    selectedTab.tabs({
 
        activate: function (event, ui) { 
            var active = selectedTab.tabs("option", "active");
            var selected = selectedTab.tabs("option", "active");
 
            if (active == 0) {
                $("#btnMoveLeftTab").hide();
            }else if (selectedTab.find("li:not(li[style='display:none'])").size()-1 == selected){
                $("#btnMoveRightTab").hide();
            }else{
                $("#btnMoveLeftTab").show();
                $("#btnMoveRightTab").show();
            }
 
        }
    });
 
    //First time loading hide the previous button
    $("#btnMoveLeftTab").hide();
  });
