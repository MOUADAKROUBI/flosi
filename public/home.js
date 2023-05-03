$(document).ready(() => {
  setInterval(() => {
      $('.alert').css('display', 'none')
  }, 4000)

  // sign in validition
  const checkUsername = /^.{5,}$/g
  const checkEmail = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/g
  const checkPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#\$%&@]).+$/g

  $('#username').on('input', function(e) {
    let value = new String(e.target.value)
    const noti = $(this).parent().next()
    if (noti.length != "" && !value.match(checkUsername)) {
      noti.addClass('show')
    } else {
      noti.removeClass('show')
    }
  })

  $('#email').on('input', function(e) {
    let value = new String(e.target.value)
    const noti = $(this).parent().next()
    if (noti.length != "" && !value.match(checkEmail)) {
      noti.addClass('show')
    } else {
      noti.removeClass('show')
    }
  })

  $('#password').on('input', function(e) {
    let value = new String(e.target.value)
    const noti = $(this).parent().next()
    if (noti.length != "" && !value.match(checkPassword)) {
      noti.addClass('show')
    } else {
      noti.removeClass('show')
    }
  })

  setInterval( () => {
    if ($('#username').val().match(checkUsername) && $('#email').val().match(checkEmail) && $('#password').val().match(checkPassword)) {
      $('.btn-singUp').prop('disabled', false)
    }else {
      $('.btn-singUp').prop({
        disabled: true
      })
    }
  }, 500)
});