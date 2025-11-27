const connection = require('../configs/database')

class Buku {
    // mencari data buku dan majalah berdasarkan keyword
    static async getBukuAndMajalah(keyword) {
        try {
            const [rows] = await connection.query(`SELECT m.id AS id, m.foto_cover AS 'foto-cover', m.judul AS judul, m.edisi AS edisi, m.no_klasifikasi, CONCAT(r.kode_rak, ' - ', ru.kode_ruangan, ' - ', l.kode_lantai) AS lokasi, 'Majalah' AS tipe FROM majalah m LEFT JOIN rak r ON m.id_rak = r.id LEFT JOIN ruangan ru ON r.id_ruangan = ru.id LEFT JOIN lantai l ON ru.id_lantai = l.id WHERE m.status_data = 'Tampil' AND (m.judul LIKE CONCAT('%', ?, '%') OR m.edisi LIKE CONCAT('%', ?, '%')) UNION SELECT b.id AS id, b.foto_cover AS 'foto-cover', b.judul AS judul, NULL AS edisi, b.no_klasifikasi, CONCAT(r.kode_rak, ' - ', ru.kode_ruangan, ' - ', l.kode_lantai) AS lokasi, 'Buku' AS tipe FROM buku b LEFT JOIN rak r ON b.id_rak = r.id LEFT JOIN ruangan ru ON r.id_ruangan = ru.id LEFT JOIN lantai l ON ru.id_lantai = l.id WHERE b.status_data = 'Tampil' AND b.judul LIKE CONCAT('%', ?, '%')`,[keyword, keyword, keyword])
            return rows
        } catch (err) {
            throw err
        }
    }

    static async getNewBukuAPI() {
        try {
            const [rows] = await connection.query(`SELECT b.id, b.judul, b.foto_cover, b.pengarang, 'Buku' AS tipe FROM buku b WHERE b.status_data = 'Tampil' ORDER BY b.dibuat_pada DESC LIMIT 4`)
            return rows
        } catch (err) {
            throw err
        }
    }

    // mengambil detail buku berdasarkan id
    static async getDetailBuku(id) {
        try {
            const [rows] = await connection.query(`SELECT b.id, b.judul, b.foto_cover, b.isbn_issn, b.no_klasifikasi, ba.bahasa AS nama_bahasa, b.jumlah_halaman, b.tahun_terbit, b.sinopsis, b.tempat_terbit, b.penerbit, k.kategori AS nama_kategori, b.pengarang, b.ketersediaan, CONCAT(r.kode_rak, ' - ', ru.kode_ruangan, ' - ', l.kode_lantai) AS lokasi FROM buku b LEFT JOIN rak r ON b.id_rak = r.id LEFT JOIN ruangan ru ON r.id_ruangan = ru.id LEFT JOIN lantai l ON ru.id_lantai = l.id LEFT JOIN bahasa ba ON b.id_bahasa = ba.id LEFT JOIN kategori k ON b.id_kategori = k.id WHERE b.id = ? AND b.status_data = 'Tampil'`, [id])
            return rows
        } catch (err) {
            throw err
        }
    }

    // mengambil buku lalu dirutakan berdasarkan waktu dibuat dan diberikan limit 
    static async getBuku(limit, offset) {
        try {
            const [rows] = await connection.query(`SELECT b.id, b.judul, b.foto_cover, b.isbn_issn, b.no_klasifikasi, CONCAT(r.kode_rak, ' - ', ru.kode_ruangan, ' - ', l.kode_lantai) AS lokasi_buku FROM buku b LEFT JOIN rak r ON b.id_rak = r.id LEFT JOIN ruangan ru ON r.id_ruangan = ru.id LEFT JOIN lantai l ON ru.id_lantai = l.id WHERE b.status_data = 'Tampil' ORDER BY b.dibuat_pada DESC LIMIT ? OFFSET ?`, [limit, offset])
            return rows
        } catch (err) {
            throw err
        }
    }

    // menyimpan data buku
    static async store(data) {
        try {
            const [result] = await connection.query(`INSERT INTO buku SET ?`, [data])
            return result
        } catch (err) {
            throw err
        }
    }

    // mengubah data buku
    static async update(id, data) {
        try {
            const [result] = await connection.query(`UPDATE buku SET ? WHERE id = ?`, [data, id])
            return result
        } catch (err) {
            throw err
        }
    }

    // menghapus data buku secara permanen
    static async hardDelete(id) {
        try {
            const [result] = await connection.query(`DELETE FROM buku WHERE id = ?`, [id])
            return result
        } catch (err) {
            throw err
        }
    }

    // mengubah statsu data 
    static async softDelete(user, id) {
        try {
            const [result] = await connection.query(`UPDATE buku SET status_data = 'Hapus', dihapus_pada = now(), dihapus_oleh = ? WHERE id = ?`,[user.nama, id])
            return result
        } catch (err) {
            throw err
        }
    }

    // mengambil semua data buku berdasarkan id
    static async getById(id) {
        try {
            const [rows] = await connection.query(`SELECT b.id, b.judul, b.foto_cover, b.isbn_issn, b.no_klasifikasi, b.id_bahasa, ba.bahasa AS nama_bahasa, b.jumlah_halaman, b.tahun_terbit, b.sinopsis, b.tempat_terbit, b.penerbit, b.id_kategori, k.kategori AS nama_kategori, b.pengarang, b.id_rak, r.kode_rak, ru.kode_ruangan, l.kode_lantai, b.ketersediaan, b.dibuat_pada, b.diubah_pada, b.dibuat_oleh, b.diubah_oleh, b.status_data FROM buku b LEFT JOIN rak r ON b.id_rak = r.id LEFT JOIN ruangan ru ON r.id_ruangan = ru.id LEFT JOIN lantai l ON ru.id_lantai = l.id LEFT JOIN bahasa ba ON b.id_bahasa = ba.id LEFT JOIN kategori k ON b.id_kategori = k.id WHERE b.status_data = 'Tampil' AND b.id = ?`,[id])
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    // memeriksa duplikasi no_klasifikasi saat create
    static async checkNoKlasifikasiCreate(data) {
        try {
            const [rows] = await connection.query(`SELECT * FROM buku WHERE no_klasifikasi = ?`, [data.no_klasifikasi])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    // memerik duplikasi isbn_issn saat create
    static async checkIsbnIssnCreate(data) {
        try {
            const [rows] = await connection.query(`SELECT * FROM buku WHERE isbn_issn = ?`, [data.isbn_issn])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    // memerik duplikasi no_klasifikasi saat edit
    static async checkNoKlasifikasiEdit(data, id) {
        try {
            const [rows] = await connection.query(`SELECT * FROM buku WHERE no_klasifikasi = ? AND id != ?`, [data.no_klasifikasi, id])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    // memerik duplikasi isbn_issn saat edit
    static async checkIsbnIssnEdit(data, id) {
        try {
            const [rows] = await connection.query(`SELECT * FROM buku WHERE isbn_issn = ? AND id != ?`, [data.isbn_issn, id])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    // total buku dengan status data tampil
    static async getCountBuku() {
        try {
            const [rows] = await connection.query(`SELECT COUNT(id) as total_buku FROM buku WHERE status_data = 'Tampil'`)
            return rows
        } catch (err) {
            throw err
        }
    }

    // mengambil buku terbaru yang dibuat dengan limit 5
    static async getNewBuku() {
        try {
            const [rows] = await connection.query(`SELECT b.judul, b.isbn_issn, b.no_klasifikasi, CONCAT(r.kode_rak, ' - ', ru.kode_ruangan, ' - ', l.kode_lantai) as lokasi_buku FROM buku b LEFT JOIN rak r ON b.id_rak = r.id LEFT JOIN ruangan ru ON r.id_ruangan = ru.id LEFT JOIN lantai l ON ru.id_lantai = l.id WHERE b.status_data = 'Tampil' ORDER BY b.dibuat_pada desc LIMIT 5`)
            return rows
        } catch (err) {
            throw err
        }
    }

    // total buku dengan status data hapus
    static async getCountBukuHapus() {
        try {
            const [rows] = await connection.query(`SELECT COUNT(id) as total_buku_hapus FROM buku WHERE status_data = 'Hapus'`)
            return rows
        } catch (err) {
            throw err
        }
    }

    // mengambil buku yang statusnya dihapus dan diurutkan descending berdasarkan waktu dihapus dengan limit 5
    static async getNewBukuHapus() {
        try {
            const [rows] = await connection.query(`SELECT b.judul, b.isbn_issn, b.no_klasifikasi, CONCAT(r.kode_rak, ' - ', ru.kode_ruangan, ' - ', l.kode_lantai) as lokasi_buku FROM buku b LEFT JOIN rak r ON b.id_rak = r.id LEFT JOIN ruangan ru ON r.id_ruangan = ru.id LEFT JOIN lantai l ON ru.id_lantai = l.id WHERE b.status_data = 'Hapus' ORDER BY b.dihapus_pada DESC LIMIT 5`
            )
            return rows
        } catch (err) {
            throw err
        }
    }

    // mengambil buku yang statusnya dihapus dan diurutkan descending berdasarkan waktu dihapus dengan limit dan offset untuk pagination
    static async getBukuHapus(limit, offset) {
        try {
            const [rows] = await connection.query(`SELECT b.id, b.judul, b.foto_cover, b.isbn_issn, b.no_klasifikasi, CONCAT(r.kode_rak, ' - ', ru.kode_ruangan, ' - ', l.kode_lantai) AS lokasi_buku FROM buku b LEFT JOIN rak r ON b.id_rak = r.id LEFT JOIN ruangan ru ON r.id_ruangan = ru.id LEFT JOIN lantai l ON ru.id_lantai = l.id WHERE b.status_data = 'Hapus' ORDER BY b.dihapus_pada DESC LIMIT ? OFFSET ?`, [limit, offset])
            return rows
        } catch (err) {
            throw err
        }
    }

    // mengubah status data buku
    static async updateStatusData(data, id) {
        try {
            const [result] = await connection.query(`UPDATE buku SET ? WHERE id = ?`, [data, id])
            return result
        } catch (err) {
            throw err
        }
    }

    // mengambil semua data buku yang dihapus berdasarkan id
    static async getByIdHapus(id) {
        try {
            const [rows] = await connection.query(`SELECT b.id, b.judul, b.foto_cover, b.isbn_issn, b.no_klasifikasi, b.id_bahasa, ba.bahasa AS nama_bahasa, b.jumlah_halaman, b.tahun_terbit, b.sinopsis, b.tempat_terbit, b.penerbit, b.id_kategori, k.kategori AS nama_kategori, b.pengarang, r.kode_rak, ru.kode_ruangan, l.kode_lantai, b.ketersediaan, b.dibuat_pada, b.diubah_pada, b.dibuat_oleh, b.diubah_oleh, b.status_data FROM buku b LEFT JOIN rak r ON b.id_rak = r.id LEFT JOIN ruangan ru ON r.id_ruangan = ru.id LEFT JOIN lantai l ON ru.id_lantai = l.id LEFT JOIN bahasa ba ON b.id_bahasa = ba.id LEFT JOIN kategori k ON b.id_kategori = k.id WHERE b.status_data = 'Hapus' AND b.id = ?`, [id])
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    // mengambil semua data buku yang dihapus berdasarkan id
    static async getCoverByIdHapus(id) {
        try {
            const [rows] = await connection.query(`SELECT id, foto_cover FROM buku WHERE status_data = 'Hapus' AND id = ?`, [id])
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    // mengambil data buku berdasarkan judul
    static async searchJudulBuku(judul) {
        try {
            const [rows] = await connection.query(`SELECT b.id, b.judul, b.foto_cover, b.isbn_issn, b.no_klasifikasi, CONCAT(r.kode_rak, ' - ', ru.kode_ruangan, ' - ', l.kode_lantai) AS lokasi_buku FROM buku b LEFT JOIN rak r ON b.id_rak = r.id LEFT JOIN ruangan ru ON r.id_ruangan = ru.id LEFT JOIN lantai l ON ru.id_lantai = l.id WHERE b.status_data = 'Tampil' AND b.judul LIKE CONCAT('%', ?, '%')`, [judul])
            return rows
        } catch (err) {
            throw err
        }
    }

    // mengambil data buku yang dihapus berdasarkan judul
    static async searchJudulBukuHapus(judul) {
        try {
            const [rows] = await connection.query(`SELECT b.id, b.judul, b.foto_cover, b.isbn_issn, b.no_klasifikasi, CONCAT(r.kode_rak, ' - ', ru.kode_ruangan, ' - ', l.kode_lantai) AS lokasi_buku FROM buku b LEFT JOIN rak r ON b.id_rak = r.id LEFT JOIN ruangan ru ON r.id_ruangan = ru.id LEFT JOIN lantai l ON ru.id_lantai = l.id WHERE b.status_data = 'Hapus' AND b.judul LIKE CONCAT('%', ?, '%')`, [judul])
            return rows
        } catch (err) {
            throw err
        }
    }

    // mengambil semua data buku berdasarkan id
    static async getCoverById(id) {
        try {
            const [rows] = await connection.query(`SELECT foto_cover from buku WHERE status_data = 'Tampil' AND id = ?`,[id])
            return rows[0]
        } catch (err) {
            throw err
        }
    }
}

module.exports = Buku
