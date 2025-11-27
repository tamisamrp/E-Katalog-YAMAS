const express = require('express')
const router = express.Router()
// import model koran
const Koran = require('../../models/Koran')
// import model penerbit koran
const PenerbitKoran = require('../../models/PenerbitKoran')
// import model pegawai
const Pegawai = require('../../models/Pegawai')
// import middleware untuk mengecek peran pengguna login
const {authManajer} = require('../../middlewares/auth')


router.get('/', authManajer, async (req, res) => {
    try {
        // mendapatkan data pegawai dari session
        const pegawaiId = req.session.pegawaiId
        const pegawai = await Pegawai.getNama(pegawaiId)

        const flashedIdPenerbit = req.flash('id_penerbit_koran')[0]
        const flashedTahun = req.flash('tahun')[0]
        const flashedBulan = req.flash('bulan')[0]
        const page = parseInt(req.query.page) || 1
        const limit = 20
        const offset = (page - 1) * limit

        const penerbitList = await PenerbitKoran.getAll()

        if (flashedIdPenerbit && flashedTahun && flashedBulan) {
            const filters = { id_penerbit_koran: flashedIdPenerbit, tahun: flashedTahun, bulan: flashedBulan }
            const koran = await Koran.searchKoranHapus(filters)
            const totalHalaman = 1
            return res.render('manajer/koran/index', { koran, pegawai, page: 1, totalHalaman, filters, penerbitList })
        }

        const koran = await Koran.getKoranHapus(limit, offset)
        const totalKoran = koran.length
        const totalHalaman = Math.ceil(totalKoran / limit)

        res.render('manajer/koran/index', { koran, pegawai, page, totalHalaman, penerbitList, filters: { id_penerbit_koran: '', tahun: '', bulan: '' } })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/manajer/dashboard')
    }
})

router.post('/search', authManajer, async (req, res) => {
    try {
        const { id_penerbit_koran, tahun, bulan } = req.body
        req.flash('id_penerbit_koran', id_penerbit_koran)
        req.flash('tahun', tahun)
        req.flash('bulan', bulan)
        return res.redirect('/manajer/koran')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/manajer/dashboard')
    }
})

router.get('/:id', authManajer, async (req, res) => {
    try {
        const { id } = req.params
        // mendapatkan data pegawai dari session
        const pegawaiId = req.session.pegawaiId
        const pegawai = await Pegawai.getNama(pegawaiId)
        const koran = await Koran.getByIdHapus(id)
        res.render('manajer/koran/detail', { koran, pegawai })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/manajer/koran')
    }
})

router.post('/edit/:id', authManajer, async (req, res) => {
    try {
        const { id } = req.params
        const { status_data } = req.body
        const data = { status_data }
        await Koran.updateStatusData(data, id)
        req.flash('success', 'Koran berhasil ditampilkan')
        res.redirect('/manajer/koran')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/manajer/koran')
    }
})

router.post('/delete/:id', authManajer, async (req, res) => {
    try {
        const { id } = req.params

        await Koran.hardDelete(id)
        req.flash('success', 'Koran berhasil dihapus')
        res.redirect('/manajer/koran')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/manajer/koran')
    }
})

module.exports = router