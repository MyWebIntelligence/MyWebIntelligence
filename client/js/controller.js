var controller = {

	init: function(){

		//$('#sectionConnexion').addClass('hide');

		$('#sectionConnexionBoxContentBoxForm').submit(function(e){

			e.preventDefault();
			return false;

		});

		$('#sectionConnexionBoxContentBoxFormButton').click(function(){

			$('#sectionConnexion').addClass('hide');

		});

		$('#sectionNavigationTerritory').click(function(){

			$('#sectionNavigationNewTerritory').removeClass('on');
			$('.sectionBody').removeClass('on');
			$('#sectionBodyTerritories').addClass('on');
			$(this).addClass('on');

		});

		$('#sectionNavigationNewTerritory').click(function(){


			$('#sectionNavigationTerritory').removeClass('on');
			$('.sectionBody').removeClass('on');
			$('#sectionBodyCreateTerritory').addClass('on');
			$(this).addClass('on');

		});

		$('.sectionBodyTerritoriesButtonsButtonResult').each(function(){

			var _this = $(this);
			_this.click(function(){

				$('#sectionBodyCreateTerritory').removeClass('on');
				$('.sectionBody').removeClass('on');
				$('#sectionBodyTerritory').addClass('on');
				$("#sectionNavigationTerritory").addClass('on');

				$(".sectionBodyTerritoryPage").removeClass('on');
				$("#sectionBodyTerritoryPages").addClass('on');

				$(".sectionBodyTerritoryButtonsButton").removeClass('on');
				$("#sectionBodyTerritoryButtonsButtonPages").addClass('on');

			});	

		});

        /*
		$('.sectionBodyTerritoriesButtonsButtonQuery').each(function(){

			var _this = $(this);
			if(!_this.hasClass('no')){

				_this.click(function(){

					_this.parent().parent().children(".sectionBodyTerritoriesQuerys").slideToggle("fast");

				});	

			}

		});
        */

        /*
		$('.sectionBodyTerritoriesQuerysLineTitle').each(function(){

			var _this = $(this);
			_this.click(function(){

				_this.parent().children(".sectionBodyTerritoriesQuerysLineForm").slideToggle("fast");

			});	

		});
        */

		$('#sectionBodyTerritoryButtonsButtonDomains').click(function(){

			$(".sectionBodyTerritoryPage").removeClass('on');
			$("#sectionBodyTerritoryDomains").addClass('on');

			$(".sectionBodyTerritoryButtonsButton").removeClass('on');
			$("#sectionBodyTerritoryButtonsButtonDomains").addClass('on');

		});

		$('#sectionBodyTerritoryButtonsButtonPages').click(function(){

			$(".sectionBodyTerritoryPage").removeClass('on');
			$("#sectionBodyTerritoryPages").addClass('on');

			$(".sectionBodyTerritoryButtonsButton").removeClass('on');
			$("#sectionBodyTerritoryButtonsButtonPages").addClass('on');

		});

		$('.sectionBodyTerritoryPagesLineTitle').click(function(){

			$('#sectionBodyView').addClass("on");

		});

		$('#sectionBodyViewClose').click(function(){

			$('#sectionBodyView').removeClass("on");

		});

		$('#sectionNavigationNewTerritory').addClass('on');
		$('#sectionBodyCreateTerritory').addClass('on');

		//$('#sectionNavigationTerritory').addClass('on');
		//$('#sectionBodyTerritories').addClass('on');

	}

}