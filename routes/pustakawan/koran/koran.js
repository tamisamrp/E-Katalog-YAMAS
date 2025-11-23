const express = require('express')
const router = express.Router()
const xlsx = require('xlsx')
const multer = require('multer')
const Koran = require('../../../models/Koran')
const PenerbitKoran = require('../../../models/PenerbitKoran')
const Pegawai = require('../../../models/Pegawai')
const {authPustakawan} = require('../.././../middlewares/auth')


const uploadExcel = multer({ storage: multer.memoryStorage() })

router.get('/', authPustakawan, async (req, res) => {
    try {
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)

        const page = parseInt(req.query.page) || 1
        const limit = 20
        const offset = (page - 1) * limit

        const penerbitList = await PenerbitKoran.getAll()

        const flashedIdPenerbit = req.flash('id_penerbit_koran')[0]
        const flashedTahun = req.flash('tahun')[0]
        const flashedBulan = req.flash('bulan')[0]
        if (flashedIdPenerbit && flashedTahun && flashedBulan) {
            const filters = { id_penerbit_koran: flashedIdPenerbit, tahun: flashedTahun, bulan: flashedBulan }
            const koran = await Koran.searchKoranTampil(filters)
            const totalHalaman = 1
            return res.render('pustakawan/koran/koran/index', { pegawai, koran, page: 1, totalHalaman, filters, penerbitList })
        }

        const koran = await Koran.getKoran(limit, offset)
        const totalKoran = koran.length
        const totalHalaman = Math.ceil(totalKoran / limit)

        res.render('pustakawan/koran/koran/index', { pegawai, koran, page, totalHalaman, filters: { id_penerbit_koran: '', tahun: '', bulan: '' }, penerbitList })

    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/dashboard')
    }
})

router.post('/search', authPustakawan, async (req, res) => {
    try {
        const { id_penerbit_koran, tahun, bulan } = req.body
        req.flash('id_penerbit_koran', id_penerbit_koran)
        req.flash('tahun', tahun)
        req.flash('bulan', bulan)
        return res.redirect('/pustakawan/koran')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/dashboard')
    }
})

router.get('/buat', authPustakawan, async (req, res) => {
    try {
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const penerbitList = await PenerbitKoran.getAll()
        res.render('pustakawan/koran/koran/buat', { pegawai, penerbitList, data: req.flash('data')[0] })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/koran')
    }
})

router.get('/:id', authPustakawan, async (req, res) => {
    try {
        const { id } = req.params
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const koran = await Koran.getKoranById(id)

        if (!koran) {
            req.flash('error', 'Data tidak ditemukan')
            return res.redirect('/pustakawan/koran')
        }
        
        res.render('pustakawan/koran/koran/detail', { pegawai, koran })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/koran')
    }
})

router.post('/create', authPustakawan, async (req, res) => {
    try {
        const { id_penerbit_koran, tahun, bulan } = req.body
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const data = { id_penerbit_koran, tahun, bulan, dibuat_oleh: pegawai.nama }

        await Koran.store(data)
        req.flash('success', 'Koran berhasil dibuat')
        res.redirect('/pustakawan/koran')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/koran')
    }
})

router.post('/create-batch-koran', authPustakawan, uploadExcel.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            req.flash('error', 'File Excel wajib diunggah')
            return res.redirect('/pustakawan/koran')
        }

        const pegawai = await Pegawai.getNama(req.session.pegawaiId)

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = xlsx.utils.sheet_to_json(sheet)

        if (!rows.length) {
            req.flash('error', 'Data pada Excel kosong')
            return res.redirect('/pustakawan/koran')
        }

        const CANONICAL_BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
        const BULAN_MAP = CANONICAL_BULAN.reduce((acc, b) => { acc[b.toLowerCase()] = b; return acc }, {})
        const isValidYear = (y) => /^\d{4}$/.test(String(y || '').trim())

        const penerbitAll = await PenerbitKoran.getAll()
        const nameToId = new Map()
        if (Array.isArray(penerbitAll)) {
            for (const p of penerbitAll) {
                if (!p || !p.nama_penerbit) continue
                nameToId.set(String(p.nama_penerbit).trim().toLowerCase(), p.id)
            }
        }

        for (let i = 0; i < rows.length; i++) {
            const r = rows[i]
            const barisKe = i + 2
            const nama_penerbit = (r.nama_penerbit || '').toString().trim()
            const tahun = (r.tahun || '').toString().trim()
            let bulan = (r.bulan || '').toString().trim()

            if (!nama_penerbit || !tahun || !bulan) {
                req.flash('error', `Data tidak lengkap pada baris ke-${barisKe}`)
                return res.redirect('/pustakawan/koran')
            }

            if (!isValidYear(tahun)) {
                req.flash('error', `Tahun tidak valid (harus 4 digit) pada baris ke-${barisKe}`)
                return res.redirect('/pustakawan/koran')
            }

            const mapped = BULAN_MAP[bulan.toLowerCase()]
            if (!mapped) {
                req.flash('error', `Bulan tidak valid pada baris ke-${barisKe}`)
                return res.redirect('/pustakawan/koran')
            }
            bulan = mapped

            const key = nama_penerbit.toLowerCase()
            const idPenerbit = nameToId.get(key)
            if (!idPenerbit) {
                req.flash('error', `Penerbit "${nama_penerbit}" tidak ditemukan pada baris ke-${barisKe}`)
                return res.redirect('/pustakawan/koran')
            }

            const exists = await Koran.checkKoran({ id_penerbit_koran: idPenerbit, tahun, bulan })
            if (exists) {
                req.flash('error', `Duplikasi data pada baris ke-${barisKe}`)
                return res.redirect('/pustakawan/koran')
            }

            const data = { id_penerbit_koran: idPenerbit, tahun, bulan, dibuat_oleh: pegawai.nama }

            await Koran.store(data)
        }

        req.flash('success', 'Data Koran berhasil diunggah')
        res.redirect('/pustakawan/koran')
    } catch (err) {
        console.error(err)
        req.flash('error', err.message || 'Gagal mengunggah data Koran')
        return res.redirect('/pustakawan/koran')
    }
})

router.get('/edit/:id', authPustakawan, async (req, res) => {
    try {
        const { id } = req.params
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const penerbitList = await PenerbitKoran.getAll()
        const koran = await Koran.getKoranById(id)
        if (!koran) {
            req.flash('error', 'Data tidak ditemukan')
            return res.redirect('/pustakawan/koran')
        }
        res.render('pustakawan/koran/koran/edit', { pegawai, koran, penerbitList })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/koran')
    }
})

router.post('/update/:id', authPustakawan, async (req, res) => {
    try {
        const { id } = req.params
        const { id_penerbit_koran, tahun, bulan, ketersediaan } = req.body
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const data = { id_penerbit_koran, tahun, bulan, ketersediaan, diubah_oleh: pegawai.nama }

        if (!data.id_penerbit_koran || !data.tahun || !data.bulan) {
            req.flash('error', 'Penerbit, tahun, dan bulan wajib diisi')
            return res.redirect(`/pustakawan/koran/edit/${id}`)
        }

        await Koran.update(data, id)
        req.flash('success', 'Koran berhasil diupdate')
        res.redirect('/pustakawan/koran')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/koran')
    }
})

router.post('/delete/:id', authPustakawan, async (req, res) => {
    try {
        const { id } = req.params
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        
        await Koran.softDelete(pegawai, id)
        req.flash('success', 'Koran berhasil dihapus')
        res.redirect('/pustakawan/koran')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/koran')
    }
})

module.exports = router