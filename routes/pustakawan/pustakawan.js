const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const Pegawai = require('../../models/Pegawai')
const {authPustakawan} = require('../../middlewares/auth')

router.get('/ubah-kata-sandi', authPustakawan, async (req, res) => {
    try {
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)

        res.render('pustakawan/pustakawan/ubahKataSandi', { 
            pegawai,
            data: req.flash('data')[0]
        })
    } catch (err) {
        console.error(err)
        res.redirect('/pustakawan/dashboard')
    }

})

router.post('/change-password', authPustakawan, async (req, res) => {
    try {
        const pegawaiId = req.session.pegawaiId
        const pegawai = await Pegawai.getById(pegawaiId)

        // destructuring req.body
        const {kata_sandi, kata_sandi_baru, konfirmasi_kata_sandi_baru} = req.body

        // menyimpan data yang diinputkan user
        const data = {kata_sandi, kata_sandi_baru, konfirmasi_kata_sandi_baru}

        // input kata sandi tidak boleh kosong
        if (!kata_sandi) {
            req.flash('error', 'kata sandi tidak boleh kosong')
            req.flash('data', req.body)
            return res.redirect('/pustakawan/ubah-kata-sandi')
        }

        // input kata sandi baru tidak boleh kosong
        if (!kata_sandi_baru) {
            req.flash('error', 'kata sandi baru tidak boleh kosong')
            req.flash('data', req.body)
            return res.redirect('/pustakawan/ubah-kata-sandi')
        }

        // input konfirmasi kata sandi baru tidak boleh kosong
        if (!konfirmasi_kata_sandi_baru) {
            req.flash('error', 'konfirmasi kata sandi baru tidak boleh kosong')
            req.flash('data', req.body)
            return res.redirect('/pustakawan/ubah-kata-sandi')
        }

        // mengecek kecocokan kata sandi lama dengan yang ada di database
        if (!(await bcrypt.compare(kata_sandi, pegawai.kata_sandi))) {
            req.flash('error', 'Kata sandi yang anda inputkan salah')
            req.flash('data', req.body)
            return res.redirect('/pustakawan/ubah-kata-sandi')
        }

        // kata sandi minimal 6 karakter
        if (kata_sandi_baru.length < 6) {
            req.flash('error', 'Password Minimal 6 karakter')
            req.flash('data', req.body)
            return res.redirect('/pustakawan/ubah-kata-sandi')
        }

        // kata sandi minimal 1 huruf kapital
        if (!/[A-Z]/.test(kata_sandi_baru)) {
            req.flash('error', 'Password Minimal 1 Huruf Kapital')
            req.flash('data', req.body)
            return res.redirect('/pustakawan/ubah-kata-sandi')
        }

        // kata sandi minimal 1 huruf kecil
        if (!/[a-z]/.test(kata_sandi_baru)) {
            req.flash('error', 'Password Minimal 1 Huruf Kecil')
            req.flash('data', req.body)
            return res.redirect('/pustakawan/ubah-kata-sandi')
        }

        // kata sandi minimal 1 angka
        if (!/\d/.test(kata_sandi_baru)) {
            req.flash('error', 'Password Minimal 1 Angka')
            req.flash('data', req.body)
            return res.redirect('/pustakawan/ubah-kata-sandi')
        }

        // cek kesesuaian kata_sandi dan konfirmasi_kata_sandi
        if (kata_sandi_baru != konfirmasi_kata_sandi_baru) {
            req.flash('error', 'Konfirmasi kata sandi baru tidak sama')
            req.flash('data', req.body)
            return res.redirect('/pustakawan/ubah-kata-sandi')
        }

        await Pegawai.changePassword(data, pegawaiId)
        req.flash('success', 'Kata sandi berhasil diubah')
        res.redirect('/pustakawan/dashboard')
    } catch (err) {
        req.flash('error', "Internal Server Error")
        res.redirect('/pustakawan/ubah-kata-sandi')
    }
})

module.exports = router