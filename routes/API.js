const express = require('express')
const router = express.Router()
const modelBuku = require('../models/Buku')
const modelMajalah = require('../models/Majalah')
const Koran = require('../models/Koran')
const PenerbitKoran = require('../models/PenerbitKoran')

router.post('/buku-majalah/search', async (req, res) => {
    try {
        const { keyword } = req.body
        const result = await modelBuku.getBukuAndMajalah(keyword)

        if (!result || !result.length) {
            return res.status(404).json({ message: 'Data tidak ditemukan' })
        }
        
        res.status(200).json({ result })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

router.get('/new-buku', async (req, res) => {
    try {
        const data = await modelBuku.getNewBukuAPI()

        return res.status(200).json({ data })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

router.get('/new-majalah', async (req, res) => {
    try {
        const data = await modelMajalah.getNewMajalahAPI()

        return res.status(200).json({ data })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

router.get('/detail/:tipe/:id', async (req, res) => {
    try {
        const { id, tipe } = req.params

        if (tipe == 'Majalah') {
            const rows = await modelMajalah.getDetailMajalah(id)
            const majalah = rows[0]

            return res.status(200).json({ majalah })
        }

        if (tipe == 'Buku') {
            const rows = await modelBuku.getDetailBuku(id)
            const buku = rows[0]

            return res.status(200).json({ buku })
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

router.post('/koran/search', async (req, res) => {
    try {
        const { id_penerbit_koran, tahun, bulan } = req.body

        const koran = await Koran.searchKoranTampil({ id_penerbit_koran, tahun, bulan })

        return res.status(200).json({ koran })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

router.get('/penerbit-koran', async (req, res) => {
    try {
        const penerbitKoran = await PenerbitKoran.getAll()

        return res.status(200).json({ penerbitKoran })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})

router.get('/new-koran', async (req, res) => {
    try {
        const data = await PenerbitKoran.getNewKoran()

        return res.status(200).json({ data })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
})


module.exports = router