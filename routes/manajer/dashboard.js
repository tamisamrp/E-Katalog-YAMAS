const express = require('express')
const router = express.Router()
// import model pegawai
const Pegawai = require('../../models/Pegawai')
// import model majalah
const Majalah = require('../../models/Majalah')
// import model buku
const Buku = require('../../models/Buku')
// import middleware untuk mengecek peran pengguna login
const {authManajer} = require('../../middlewares/auth')
// import model koran
const Koran = require('../../models/Koran')

// router get dashboard manajer
router.get('/', authManajer, async (req, res) => {
    try {
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)

        // total buku dengan status data hapus
        const totalBukuHapus = await Buku.getCountBukuHapus()
        // total majalah dengan status hapus
        const totalMajalahHapus = await Majalah.getCountMajalahHapus()
        // total koran dengan status data hapus
        const totalKoranHapus = await Koran.getCountKoranHapus()
        // mengambil buku terbaru yang di hapus
        const newBukuHapus = await Buku.getNewBukuHapus()
        // mengambil majalah terbaru yang di hapus
        const newMajalahHapus = await Majalah.getNewMajalahHapus()
        // mengambil koran terbaru yang di hapus
        const newKoranHapus = await Koran.getNewKoranHapus()

        res.render('manajer/dashboard', { totalBukuHapus, totalMajalahHapus, totalKoranHapus, newBukuHapus, newMajalahHapus, newKoranHapus, pegawai })
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/')
    }
})


module.exports = router