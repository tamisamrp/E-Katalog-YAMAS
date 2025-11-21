const express = require('express')
const router = express.Router()
const Pegawai = require('../models/Pegawai')
const bcrypt = require('bcryptjs')

router.get('/', (req, res) => {
    try {
        res.render('auth/login', {
            data: req.flash('data')[0]
        })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/')
    }
})

router.post('/log', async (req, res) => {
    try {
        const { nomor_pegawai, kata_sandi } = req.body
        const data = { nomor_pegawai, kata_sandi }

        if (!nomor_pegawai) {
            req.flash('error', 'Nomor Pegawai diperlukan')
            req.flash('data', data)
            return res.redirect('/')
        }

        if (!kata_sandi) {
            req.flash('error', 'Kata Sandi diperlukan')
            req.flash('data', data)
            return res.redirect('/')
        }

        const pegawai = await Pegawai.login(data)

        if (!pegawai) {
            req.flash('error', 'Nomor Pegawai yang Anda masukkan salah')
            req.flash('data', data)
            return res.redirect('/')
        }

        const aplikasiEkatalog = pegawai.aplikasi.find(
            app => app.nama_aplikasi == 'e-katalog'
        )

        if (!aplikasiEkatalog) {
            req.flash('error', 'Akun Anda tidak memiliki akses untuk login ke aplikasi ini')
            req.flash('data', data)
            return res.redirect('/')
        }

        if (aplikasiEkatalog.hak_akses != 'pustakawan' && aplikasiEkatalog.hak_akses != 'manajer') {
            req.flash('error', 'Akun Anda tidak memiliki tidak memiliki hak akses')
            req.flash('data', data)
            return res.redirect('/')
        }

        const now = new Date()
        const mulai = pegawai.periode_mulai ? new Date(pegawai.periode_mulai) : null
        const berakhir = pegawai.periode_berakhir ? new Date(pegawai.periode_berakhir) : null

        if (mulai && berakhir && !(now >= mulai && now <= berakhir)) {
            req.flash('error', 'Akun Anda tidak aktif pada periode ini')
            req.flash('data', data)
            return res.redirect('/')
        }

        if (pegawai.status_akun !== 'Aktif') {
            req.flash('error', 'Status akun belum aktif, silakan hubungi Manajer')
            req.flash('data', data)
            return res.redirect('/')
        }

        if (!(await bcrypt.compare(kata_sandi, pegawai.kata_sandi))) {
            req.flash('error', 'Kata Sandi yang Anda masukkan salah')
            req.flash('data', data)
            return res.redirect('/')
        }

        req.session.pegawaiId = pegawai.id
        req.session.hak_akses = aplikasiEkatalog.hak_akses

        if (aplikasiEkatalog.hak_akses == 'pustakawan') {
            return res.redirect('/pustakawan/dashboard')
        }

        if (aplikasiEkatalog.hak_akses == 'manajer') {
            return res.redirect('/manajer/dashboard')
        }

    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/')
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