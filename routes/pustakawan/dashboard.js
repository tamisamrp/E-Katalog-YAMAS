const express = require('express')
const router = express.Router()
// import model buku
const Buku = require('../../models/Buku')
// import model majalah
const Majalah = require('../../models/Majalah')
// import model koran
const Koran = require('../../models/Koran')
// import model pegawai
const Pegawai = require('../../models/Pegawai')
// import middleware untuk mengecek peran pengguna login
const {authPustakawan} = require('../../middlewares/auth')

// route view dashboard pustakawan
router.get('/', authPustakawan, async (req, res) => {
    try {
        // mendapatkan id pengguna dari session
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)

        // total buku dengan status data tampil
        const totalBuku = await Buku.getCountBuku()
        // total majalah dengan status data tampil
        const totalMajalah = await Majalah.getCountMajalah()
        // total koran dengan status data tampil
        const totalKoran = await Koran.getCountKoran()
        // mengambil buku terbaru yang dibuat
        const newBuku = await Buku.getNewBuku()
        // mengambil majalah terbaru yang dibuat
        const newMajalah = await Majalah.getNewMajalah()
        // mengambil koran terbaru yang dibuat
        const newKoran = await Koran.getNewKoran()
        
        res.render('pustakawan/dashboard', { totalBuku, totalMajalah, totalKoran, newBuku, newMajalah, newKoran, pegawai })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/')
    }
})

module.exports = router