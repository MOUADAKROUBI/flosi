$(document).ready(() => {
    
    $('.add-row').click(() => {
        if ($('.add-row').text() === 'edit') {
            console.log(idOfEtid);
            let nameOfProduct = $('#nameOfProduct').val();
            let price = Number($('#price').val());
            let friendCkeck = [];
            /* -------------------- */
            fetch('/friends')
            .then(res => res.json())
            .then( (data) => {
                data.forEach((invetedResult) => {
                    cpt = 0
                    for (let i = 0; i < data.length; i++) {
                        if (invetedResult.name_inveted == friend[i]) {
                            friendCkeck.push({
                                username: invetedResult.name_inveted, 
                                Consumption: 1
                            })
                            cpt++;
                        }
                    }
                    if (cpt == 0 ) {
                        friendCkeck.push({
                            username: invetedResult.name_inveted, 
                            Consumption: 0
                        })
                    }
                })
            })
            .catch((err) => {
                console.error(err);
            })
        }
    });
            
    $('.ckeck-all').click(() => {
        $('input[type="checkbox"]').prop('checked', true );
    });

    $('.output').click((e) => {
        if (e.target.classList.contains('delete')) {
            if (confirm('are you sure to remove this purchase: ')) {
                // this case if i click the icon
                let id = e.target.parentElement.parentElement.parentElement.dataset.row;
                if (typeof id == "undefined") {
                    const id_2 = e.target.parentElement.parentElement.dataset.row;
                    deletePurchaseFromDatabase(id_2);
                    e.target.parentElement.parentElement.remove();
                } else {
                    deletePurchaseFromDatabase(id);
                    e.target.parentElement.parentElement.parentElement.remove();
                }
            }
        }
        if (e.target.classList.contains('modifay')) {
            if (confirm('are you sure to edit this purchase: ')) {
                idOfEtid = e.target.parentElement.parentElement.parentElement.dataset.row;
                if (typeof idOfEtid == "undefined") {
                    idOfEtid = e.target.parentElement.parentElement.dataset.row;
                }
                fetch('/room/:id/get_purchases')
                .then(res => res.json())
                .then((data) => {
                    data.forEach((purchase) => {
                        if(purchase._id == idOfEtid) {
                            $('#nameOfProduct').val(purchase.nameOfProduct);
                            $('#price').val(purchase.price);
                            purchase.ckeckFriends.forEach( (friend) => {
                                if (friend.Consumption == 1) {
                                    $('#'+friend.username.replace(/\s+/g, "_")).prop('checked', true);
                                }
                            })
                        }
                    })
                })
                .catch((err) => {
                    console.error(err);
                })
                $('.add-row').text('edit');
            }
        }
    })

    $('.clear-all').click(() => {
        if (confirm('are you sure to remove all purchases: ')) {
            fetch('/friends')
            .then(res => res.json())
            .then( data => {
                data.forEach(friend => {
                    $('#'+ friend.name_inveted.replace(/\s+/g, "_") +'Price').text('');
                })
            }).catch((err) => {
                console.log(err);
            })
            fetch('/room/:id/deleteAll_purchases', {
                method: 'DELETE'
            })
            .then( res => {
                console.log('All purchases deleted successfully');
                $('.output').text('');
            }).catch((err) => {
                console.log(err);
            })
        }
    });

    $('.calcul').click(() => {
        const id_room = window.location.pathname.split('/')[2];
        fetch(`/room/${id_room}/get_purchases`)
        .then(res => res.json())
        .then(purchases => {
            fetch('/friends')
            .then(res => res.json())
            .then(friends => {
                friends.forEach(friend => {
                    let cpt = 0;
                    purchases.forEach( purchase => {
                        purchase.ckeckFriends.forEach( ckeckFriend => {
                            if (ckeckFriend.username == friend.name_inveted && ckeckFriend.Consumption == 1) {
                                totalPrice = $('#'+'total-price-'+purchase._id).text();
                                cpt += Number(totalPrice);
                            }
                        })
                    })
                    $('#'+friend.name_inveted.replace(/\s+/g, "_")+'Price').text(cpt);
                })
            })
            .catch((err) => {
                console.log(err);
            })
        })
        .catch((err) => {
            console.log(err);
        })
    });

    $('.th-output').dblclick(() => {
        $('#mouadPrice').hide()
        $(this).css('text-decoration', 'line-through');
        $(this).css("background-color", "#eee");
    });

    $('.chevron-down-btn').click(() => {
        $('.setting-box').toggle();
    });

    $('.btn-notification').click(() => {
        $('.notification-box').toggle();
    });

    setInterval( () => {
        $('.alert').css('display', 'none')
    }, 4000)

    function deletePurchaseFromDatabase(id) {
        const data = {
            id_purchase: id 
        };
        
        const id_room = window.location.pathname.split('/')[2];
        fetch(`/room/${id_room}/delete_purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error(error));  
    }

    function updatePurchaseFromDatabase(id, newPurchase) {
        
    }
    
    $('.delete-friend').submit(() => {
        let ckeckFriends = []
        fetch('/friends')
        .then(res => res.json())
        .then((data) => {
            data.forEach( friend => {
                if ($('#'+friend.name_inveted.replace(/\s+/g, "_")+":checked").length == 1) {
                    ckeckFriends.push(
                        {
                            username: $('#'+friend.name_inveted.replace(/\s+/g, "_")).val()
                        }
                    )
                }
            })
        })
        .catch(error => console.error(error));

        const id_room = window.location.pathname.split('/')[2];
        fetch(`/room/${id_room}/deleteFriend`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ckeckFriends)
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error(error)); 
    });

});