$(function () {
    include()
    populate()
    linkPages
})

const include = () => {
    var includes = $('[data-include]')
    $.each(includes, function () {
        var file = 'views/' + $(this).data('include') + '.html'
        $(this).load(file, () => {
            if($(this).data('include') === 'header'){
                const path = window.location.pathname.replace('/','').replace('.html','')
                $(`#${path === '' ? 'index':path}`).addClass('active')
            }
        })
        
    })
}

const populate = () => {
    var card_ref = $('[data-ref]')
    $.each(card_ref, function () {
        
        const ref = references[$(this).data('ref')]

        const image = './views/images/' + ref.image

        $.get('/views/card.html', (r) => {
            response = $(r)
            
            $(response).children('img').attr('src', `${image}`)
            $(response).children('span').html(ref.title)

            $(response).on('click', () => {
                window.open(ref.url, '_blank');
            })

            $(this).html(response)
        })
        // $(this).load(file)
    })
}

const linkPages = () => {
    

    
}