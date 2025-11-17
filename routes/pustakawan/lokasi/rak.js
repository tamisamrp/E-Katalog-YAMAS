const express = require('express')
const router = express.Router()
//import model rak 
const Rak = require('../../../models/Rak')
//import model ruangan 
const Ruangan = require('../../../models/Ruangan')
// import model pengguna
// import middleware untuk mengecek peran pengguna login
const {authPustakawan} = require('../.././../middlewares/auth')


//menampilakn semua data rak
router.get('/', authPustakawan, async(req, res) => {
    try {
        // mendapatkan id pengguna dari session
        const userId = req.session.penggunaId
        const user = await modelPengguna.getNamaPenggunaById(userId)

        // mengambil semua data rak
        const data = await Rak.getAll()

        res.render('pengurus/pustakawan/lokasi/rak/index', {data, user})
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/pustakawan/dashboard')
    }
})

router.get('/buat', authPustakawan, async (req, res) => {
    try {
        // mendapatkan id pengguna dari session
        const userId = req.session.penggunaId
        const user = await modelPengguna.getNamaPenggunaById(userId)

        // mengambil semua data ruangan
        const ruangan = await Ruangan.getAll()

        res.render('pengurus/pustakawan/lokasi/rak/buat', {
            ruangan, 
            user,
            data: req.flash('data')[0]
        })
    } catch (err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/pustakawan/rak')
    }
})

//menabahkan data rak baru
router.post('/create', authPustakawan, async(req, res) => {
    try {
        // destructuring req.body
        const {id_ruangan, kode_rak} = req.body
        // menyimpan data yang diinputkan user
        const data = {id_ruangan, kode_rak}

        // memeriksa apakah kode ruangan sudah ada
        if (await Rak.checkRakCreate(data)) {
            req.flash('error', 'Kode Rak sudah ada')
            req.flash('data', req.body)
            return res.redirect('/pustakawan/rak/buat')
        }

        await Rak.store(data)
        res.redirect('/pustakawan/rak')
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/pustakawan/rak')
    }
})

router.get('/edit/:id', authPustakawan, async (req, res) => {
    try {
        // destructuring req.params
        const {id} = req.params
        // mendapatkan id pengguna dari session
        const userId = req.session.penggunaId
        const user = await modelPengguna.getNamaPenggunaById(userId)

        // mengambil data rak berdasarkan id
        const rak = await Rak.getById(id)
        // mengambil semua data ruangan
        const ruangan = await Ruangan.getAll()

        res.render('pengurus/pustakawan/lokasi/rak/edit', {rak, ruangan, user})
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/pustakawan/rak')
    }
})

//memgupdate data rak berdasarkan id
router.post('/update/:id', authPustakawan, async(req, res) => {
    try {
        // destructuring req.params
        const {id} = req.params
        // destructuring req.body
        const {kode_rak, id_ruangan} = req.body
        // menyimpan data yang diinputkan user
        const data = {kode_rak, id_ruangan}
        
        // memeriksa apakah kode ruangan tidak boleh sama
        if (await Rak.checkRakUpdate(data, id)) {
            req.flash('error', 'Kode Rak sudah ada')
            return res.redirect(`/pustakawan/rak/edit/${id}`)
        }

        await Rak.update(data, id)
        req.flash('success', 'Data berhasil Diupdate')
        res.redirect('/pustakawan/rak')
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/pustakawan/rak')
    }
})

//mengapus data rak berdasarakn id
router.post('/delete/:id', authPustakawan, async (req, res) => {
    try {
        // destructuring req.params
        const {id} = req.params

        // menghapus rak berdasarkan id rak
        await Rak.delete(id)
        req.flash('success', 'Data Berhasil Dihapus')
        res.redirect('/pustakawan/rak')
    } catch(err) {
        console.error(err)
        req.flash('error', "Internal Server Error")
        res.redirect('/pustakawan/rak')
    }
})

module.exports = router