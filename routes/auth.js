const express = require('express')
const router = express.Router()
const Pegawai = require('../models/Pegawai')
const bcrypt = require('bcryptjs')

// Login Pustakawan
router.get('/masuk-pustakawan', (req, res) => {
    try {
        res.render('auth/login-pustakawan', {
            data: req.flash('data')[0]
        })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/')
    }
})

router.post('/log-pustakawan', async (req, res) => {
    try {
        const { nomor_pegawai, kata_sandi } = req.body
        const data = { nomor_pegawai, kata_sandi }

        if (!nomor_pegawai) {
            req.flash('error', 'Nomor Pegawai diperlukan')
            req.flash('data', data)
            return res.redirect('/masuk-pustakawan')
        }

        if (!kata_sandi) {
            req.flash('error', 'Kata Sandi diperlukan')
            req.flash('data', data)
            return res.redirect('/masuk-pustakawan')
        }

        const pegawai = await Pegawai.login(data)

        if (!pegawai) {
            req.flash('error', 'Nomor Pegawai yang Anda masukkan salah')
            req.flash('data', data)
            return res.redirect('/masuk-pustakawan')
        }

        const aplikasiEkatalog = pegawai.aplikasi.find(
            app => app.nama_aplikasi == 'e-katalog'
        )

        if (!aplikasiEkatalog) {
            req.flash('error', 'Akun Anda tidak memiliki akses untuk login ke aplikasi ini')
            req.flash('data', data)
            return res.redirect('/masuk-pustakawan')
        }

        if (aplikasiEkatalog.hak_akses != 'pustakawan') {
            req.flash('error', 'Akun Anda tidak memiliki hak akses sebagai Pustakawan')
            req.flash('data', data)
            return res.redirect('/masuk-pustakawan')
        }

        const now = new Date()
        const mulai = pegawai.periode_mulai ? new Date(pegawai.periode_mulai) : null
        const berakhir = pegawai.periode_berakhir ? new Date(pegawai.periode_berakhir) : null

        if (mulai && berakhir && !(now >= mulai && now <= berakhir)) {
            req.flash('error', 'Akun Anda tidak aktif pada periode ini')
            req.flash('data', data)
            return res.redirect('/masuk-pustakawan')
        }

        if (pegawai.status_akun !== 'Aktif') {
            req.flash('error', 'Status akun belum aktif, silakan hubungi Manajer')
            req.flash('data', data)
            return res.redirect('/masuk-pustakawan')
        }

        if (!(await bcrypt.compare(kata_sandi, pegawai.kata_sandi))) {
            req.flash('error', 'Kata Sandi yang Anda masukkan salah')
            req.flash('data', data)
            return res.redirect('/masuk-pustakawan')
        }

        req.session.pegawaiId = pegawai.id
        req.session.hak_akses = aplikasiEkatalog.hak_akses

        return res.redirect('/pustakawan/dashboard')

    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/masuk-pustakawan')
    }
})

// Login Manajer
router.get('/masuk-manajer', (req, res) => {
    try {
        res.render('auth/login-manajer', {
            data: req.flash('data')[0]
        })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/')
    }
})

router.post('/log-manajer', async (req, res) => {
    try {
        const { nomor_pegawai, kata_sandi } = req.body
        const data = { nomor_pegawai, kata_sandi }

        if (!nomor_pegawai) {
            req.flash('error', 'Nomor Pegawai diperlukan')
            req.flash('data', data)
            return res.redirect('/masuk-manajer')
        }

        if (!kata_sandi) {
            req.flash('error', 'Kata Sandi diperlukan')
            req.flash('data', data)
            return res.redirect('/masuk-manajer')
        }

        const pegawai = await Pegawai.login(data)

        if (!pegawai) {
            req.flash('error', 'Nomor Pegawai yang Anda masukkan salah')
            req.flash('data', data)
            return res.redirect('/masuk-manajer')
        }

        const aplikasiEkatalog = pegawai.aplikasi.find(
            app => app.nama_aplikasi == 'e-katalog'
        )

        if (!aplikasiEkatalog) {
            req.flash('error', 'Akun Anda tidak memiliki akses untuk login ke aplikasi ini')
            req.flash('data', data)
            return res.redirect('/masuk-manajer')
        }

        if (aplikasiEkatalog.hak_akses != 'manajer') {
            req.flash('error', 'Akun Anda tidak memiliki hak akses sebagai Manajer')
            req.flash('data', data)
            return res.redirect('/masuk-manajer')
        }

        const now = new Date()
        const mulai = pegawai.periode_mulai ? new Date(pegawai.periode_mulai) : null
        const berakhir = pegawai.periode_berakhir ? new Date(pegawai.periode_berakhir) : null

        if (mulai && berakhir && !(now >= mulai && now <= berakhir)) {
            req.flash('error', 'Akun Anda tidak aktif pada periode ini')
            req.flash('data', data)
            return res.redirect('/masuk-manajer')
        }

        if (pegawai.status_akun !== 'Aktif') {
            req.flash('error', 'Status akun belum aktif, silakan hubungi Manajer')
            req.flash('data', data)
            return res.redirect('/masuk-manajer')
        }

        if (!(await bcrypt.compare(kata_sandi, pegawai.kata_sandi))) {
            req.flash('error', 'Kata Sandi yang Anda masukkan salah')
            req.flash('data', data)
            return res.redirect('/masuk-manajer')
        }

        req.session.pegawaiId = pegawai.id
        req.session.hak_akses = aplikasiEkatalog.hak_akses

        return res.redirect('/manajer/dashboard')

    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/masuk-manajer')
    }
})

router.get('/logout', async(req, res) => {
    try {
        req.session.destroy()
        res.redirect('/')
    } catch (err) {
        console.error(err)
        req.flash('error', 'Internal server error')
        if (req.session.hak_akses == "manajer") return res.redirect('/manjer/dashboard')
        if (req.session.hak_akses == "pustakawan") return res.redirect('/pustakawan/dashboard')
    }
})

module.exports = router