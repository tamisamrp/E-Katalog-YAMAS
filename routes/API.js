const express = require('express')
const router = express.Router()
const modelBuku = require('../../model/modelBuku')
const modelMajalah = require('../../model/modelMajalah')

router.get('/', async (req, res) => {
    try {
        res.render('pengguna/katalogBukuDanMajalah/index')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/login')
    }
})

router.post('/', async (req, res) => {
    try {
        const {keyword} = req.body
        const result = await modelBuku.getBukuAndMajalah(keyword)

        res.render('pengguna/katalogBukuDanMajalah/index', { 
            result, 
            keyword
        })
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/login')
    }
})

router.get('/detail/:tipe/:id', async (req, res) => {
    try {
        const { id, tipe } = req.params

        if (tipe == 'Majalah') {
            const rows = await modelMajalah.getDetailMajalah(id)
            if (rows.length === 0) {
                req.flash('error', 'Majalah tidak ditemukan')
                return res.redirect('/')
            }
            const majalah = rows[0]
            res.render('pengguna/katalogBukuDanMajalah/detail_majalah', { majalah })
        } else if (tipe == 'Buku') {
            const rows = await modelBuku.getDetailBuku(id)
            if (rows.length === 0) {
                req.flash('error', 'Buku tidak ditemukan')
                return res.redirect('/')
            }
            const buku = rows[0]
            res.render('pengguna/katalogBukuDanMajalah/detail_buku', { buku })
        } else {
            req.flash('error', 'Tipe tidak valid')
            res.redirect('/')
        }
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/')
    }
})


module.exports = router