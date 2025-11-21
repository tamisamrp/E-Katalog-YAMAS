const authPustakawan = (req, res, next) => {
    try {
        if (req.session.hak_akses == 'pustakawan') {
            return next()
        }

        req.flash('error', 'Anda tidak memiliki akses ke halaman tersebut')
        return res.redirect('/')
    } catch (err) {
        console.log(err)
        req.flash('error', 'Internal Server Error')
        res.redirect('/')
    }
}

const authManajer = (req, res, next) => {
    try {
        if (req.session.hak_akses == 'manajer') {
            return next()
        }

        req.flash('error', 'Anda tidak memiliki akses ke halaman tersebut')
        return res.redirect('/')
    } catch (err) {
        console.log(err)
        req.flash('error', 'Internal Server Error')
        res.redirect('/')
    }
}

module.exports = { authPustakawan, authManajer }
