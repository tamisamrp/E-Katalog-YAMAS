const express = require('express')
const router = express.Router()
//import model bahasa 
const Bahasa = require('../../../models/Bahasa')
// import model pegawai
const Pegawai = require('../../../models/Pegawai')
// import middleware untuk mengecek peran pengguna login
const {authPustakawan} = require('../.././../middlewares/auth')

//menampilakn semua data bahasa
router.get('/', authPustakawan, async (req, res) => {
    try {
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const data = await Bahasa.getAll()

        res.render('pustakawan/data-induk/bahasa/index', {data, pegawai})
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/dashboard')
    }
})

//menampilkan halaman untuk menambahkan data bahasa
router.get('/buat', authPustakawan, async (req, res) => {
    try {
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)

        res.render('pustakawan/data-induk/bahasa/buat', { 
            pegawai,
            data: req.flash('data')[0]
        })
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/dashboard')
    }
})

//menabahkan data bahasa baru
router.post('/create', authPustakawan, async (req, res) => {
    try {
        // destructuring req.body
        const {bahasa} = req.body

        // menyimpan data yang diinputkan user
        const data = {bahasa}

        // input bahasa tidak boleh kosong
        if (!data.bahasa) {
            req.flash("error", "Bahasa tidak boleh kosong")
            req.flash('data', req.body)
            return res.redirect('/pustakawan/bahasa/buat')
        }

        // memeriksa apakah bahasa sudah ada
        if (await Bahasa.checkBahasaCreate(data)) {
            req.flash("error", "Bahasa sudah dibuat")
            req.flash('data', req.body)
            return res.redirect('/pustakawan/bahasa/buat')
        }

        await Bahasa.store(data)
        req.flash('success', 'Data Berhasil Ditambahkan')
        res.redirect('/pustakawan/bahasa')
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/bahasa')
    }
})

//menampilkan halaman untuk mengedit bahasa
router.get('/edit/:id', authPustakawan, async(req, res) => {
    try {
        const {id} = req.params
        const pegawai = await Pegawai.getNama(req.session.pegawaiId)
        const data = await Bahasa.getById(id)

        res.render('pustakawan/data-induk/bahasa/edit', {data, pegawai})
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/bahasa')
    }
})

//memgupdate data bahasa berdasarkan id
router.post('/update/:id', authPustakawan, async (req, res) => {
    try {
        // destructuring req.params
        const {id} = req.params

        // destructuring req.body
        const {bahasa} = req.body

        // menyimpan data yang diinputkan user
        const data = {bahasa}
        
        // input bahasa tidak boleh kosong
        if (!bahasa) {
            req.flash("error", "Bahasa tidak boleh kosong")
            req.flash('data', req.body)
            return res.redirect(`/pustakawan/bahasa/edit/${id}`)
        }

        // memeriksa apakah bahasa sudah ada
        if (await Bahasa.checkBahasaUpdate(data, id)) {
            req.flash("error", "Bahasa sudah dibuat")
            req.flash('data', req.body)
            return res.redirect(`/pustakawan/bahasa/edit/${id}`)
        }

        // memperbarui data bahasa
        await Bahasa.update(data, id)
        req.flash('success', 'Data Berhasil Diedit')
        res.redirect('/pustakawan/bahasa')
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        req.flash('data', req.body)
        return res.redirect('/pustakawan/bahasa')
    }
})

//mengapus data bahasa berdasarakn id
router.post('/delete/:id', authPustakawan, async (req, res) => {
    try {
        // destructuring req.params
        const {id} = req.params

        // memeriksa apakah bahasa sudah digunakan
        if (await Bahasa.checkBahasaUsed(id)) {
            req.flash("error", "Bahasa masih digunakan oleh buku atau majalah lain")
            req.flash('data', req.body)
            return res.redirect('/pustakawan/bahasa')
        }

        await Bahasa.delete(id)
        req.flash('success', 'Data Berhasil Dihapus')
        res.redirect('/pustakawan/bahasa')
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        return res.redirect('/pustakawan/bahasa')
    }
})

module.exports = router
