const connection = require('../configs/database')

class Majalah {
    // mengambil detail majalah berdasarkan id
    static async getDetailMajalah(id) {
        try {
            const [rows] = await connection.query(`
                SELECT 
                    m.id,
                    m.judul,
                    m.foto_cover,
                    m.edisi,
                    m.no_klasifikasi,
                    b.bahasa AS nama_bahasa,
                    m.tahun_terbit,
                    m.sinopsis,
                    m.tempat_terbit,
                    m.penerbit,
                    k.kategori AS nama_kategori,
                    m.ketersediaan,
                    CONCAT(r.kode_rak, ' - ', ru.kode_ruangan, ' - ', l.kode_lantai) AS lokasi
                FROM majalah m
                LEFT JOIN bahasa b ON m.id_bahasa = b.id
                LEFT JOIN kategori k ON m.id_kategori = k.id
                LEFT JOIN rak r ON m.id_rak = r.id
                LEFT JOIN ruangan ru ON r.id_ruangan = ru.id
                LEFT JOIN lantai l ON ru.id_lantai = l.id
                WHERE m.id = ? AND m.status_data = 'Tampil'
            `,[id])
            return rows
        } catch (err) {
            throw err
        }
    }

    // mengambil semua majalah dengan status data tampil dengan limit dan offset
    static async getMajalah(limit, offset) {
        try {
            const [rows] = await connection.query(`
                SELECT 
                    m.id,
                    m.judul,
                    m.foto_cover,
                    m.edisi,
                    m.no_klasifikasi,
                    b.bahasa AS nama_bahasa,
                    k.kategori AS nama_kategori,
                    CONCAT(r.kode_rak, ' - ', ru.kode_ruangan, ' - ', l.kode_lantai) AS lokasi_majalah
                FROM majalah m
                LEFT JOIN bahasa b ON m.id_bahasa = b.id
                LEFT JOIN kategori k ON m.id_kategori = k.id
                LEFT JOIN rak r ON m.id_rak = r.id
                LEFT JOIN ruangan ru ON r.id_ruangan = ru.id
                LEFT JOIN lantai l ON ru.id_lantai = l.id
                WHERE m.status_data = 'Tampil'
                ORDER BY m.dibuat_pada DESC
                LIMIT ? OFFSET ?
            `, [limit, offset])
            return rows
        } catch (err) {
            throw err
        }
    }

    // mengmbil semua data majalah dengan status data tampil berdasarakan id
    static async getById(id) {
        try {
            const [rows] = await connection.query(`
                SELECT 
                    m.id,
                    m.judul,
                    m.foto_cover,
                    m.edisi,
                    m.no_klasifikasi,
                    b.bahasa AS nama_bahasa,
                    m.id_bahasa,
                    k.kategori AS nama_kategori,
                    m.id_kategori,
                    m.tahun_terbit,
                    m.sinopsis,
                    m.tempat_terbit,
                    m.penerbit,
                    m.id_rak,
                    r.kode_rak,
                    ru.kode_ruangan,
                    l.kode_lantai,
                    m.ketersediaan,
                    m.dibuat_pada,
                    m.diubah_pada,
                    m.dibuat_oleh,
                    m.diubah_oleh,
                    m.status_data
                FROM majalah m
                LEFT JOIN bahasa b ON m.id_bahasa = b.id
                LEFT JOIN kategori k ON m.id_kategori = k.id
                LEFT JOIN rak r ON m.id_rak = r.id
                LEFT JOIN ruangan ru ON r.id_ruangan = ru.id
                LEFT JOIN lantai l ON ru.id_lantai = l.id
                WHERE m.status_data = 'Tampil' AND m.id = ?
            `,[id])
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    // menyimpan data majalah
    static async store(data) {
        try {
            const [results] = await connection.query(`INSERT INTO majalah SET ?`, [data])
            return results
        } catch (err) {
            throw err
        }
    }

    // mengupdate data majalah
    static async update(id, data) {
        try {
            const [results] = await connection.query(`UPDATE majalah SET ? WHERE id = ?`, [data, id])
            return results
        } catch (err) {
            throw err
        }
    }

    // mengahapus data majalah secara permanen
    static async hardDelete(id) {
        try {
            const [results] = await connection.query(`DELETE FROM majalah WHERE id = ?`, [id])
            return results
        } catch (err) {
            throw err
        }
    }

    // mengubah status data menjadi delete
    static async softDelete(user, id) {
        try {
            const [results] = await connection.query(`UPDATE majalah SET status_data = 'Hapus', dihapus_pada = NOW(), dihapus_oleh = ? WHERE id = ?`,[user.nama, id]
            )
            return results
        } catch (err) {
            throw err
        }
    }

    // memeriksa duplikasi no_klasifikasi saat create
    static async checkNoKlasifikasiCreate(data) {
        try {
            const [rows] = await connection.query(`SELECT * FROM majalah WHERE no_klasifikasi = ?`, [data.no_klasifikasi])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    // memeriksa duplikasi no_klasifikasi saat edit
    static async checkNoKlasifikasiEdit(data, id) {
        try {
            const [rows] = await connection.query(`SELECT * FROM majalah WHERE no_klasifikasi = ? AND id != ?`,[data.no_klasifikasi, id])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    static async checkISBNOrISSN(data) {
        try {
            const [rows] = await connection.query(`SELECT * FROM majalah WHERE isbn_issn = ?`,[data.isbn_issn])
            return rows.length > 0
        } catch (err) {
            throw err
        }
    }

    // total majalah dengan status data tampil
    static async getCountMajalah() {
        try {
            const [rows] = await connection.query(`SELECT COUNT(id) AS total_majalah FROM majalah WHERE status_data = 'Tampil'`)
            return rows
        } catch (err) {
            throw err
        }
    }

    // mengambil majalah terbaru yang dibuat dengan limit 5
    static async getNewMajalah() {
        try {
            const [rows] = await connection.query(`SELECT m.judul, m.edisi, m.no_klasifikasi, CONCAT(r.kode_rak, ' - ', ru.kode_ruangan, ' - ', l.kode_lantai) AS lokasi_majalah FROM majalah m LEFT JOIN rak r ON m.id_rak = r.id LEFT JOIN ruangan ru ON r.id_ruangan = ru.id LEFT JOIN lantai l ON ru.id_lantai = l.id WHERE m.status_data = 'Tampil' ORDER BY m.dibuat_pada DESC LIMIT 5`)
            return rows
        } catch (err) {
            throw err
        }
    }

    // mengambil majalah yang statusnya dihapus dan diurutkan descending berdasarkan waktu dihapus dengan limit 5
    static async getNewMajalahHapus() {
        try {
            const [rows] = await connection.query(`SELECT m.judul, m.edisi, m.no_klasifikasi, CONCAT(r.kode_rak, ' - ', ru.kode_ruangan, ' - ', l.kode_lantai) AS lokasi_majalah FROM majalah m LEFT JOIN rak r ON m.id_rak = r.id LEFT JOIN ruangan ru ON r.id_ruangan = ru.id LEFT JOIN lantai l ON ru.id_lantai = l.id WHERE m.status_data = 'Hapus' ORDER BY m.dihapus_pada DESC LIMIT 5`)
            return rows
        } catch (err) {
            throw err
        }
    }

    // total majalah dengan status data hapus
    static async getCountMajalahHapus() {
        try {
            const [rows] = await connection.query(`SELECT COUNT(id) AS total_majalah FROM majalah WHERE status_data = 'Hapus'`)
            return rows
        } catch (err) {
            throw err
        }
    }

    // mengambil majalah yang statusnya dihapus dengan limit dan offset
    static async getMajalahHapus(limit, offset) {
        try {
            const [rows] = await connection.query(`SELECT m.id, m.judul, m.foto_cover, m.edisi, m.no_klasifikasi, CONCAT(r.kode_rak, ' - ', ru.kode_ruangan, ' - ', l.kode_lantai) AS lokasi_majalah FROM majalah m LEFT JOIN rak r ON m.id_rak = r.id LEFT JOIN ruangan ru ON r.id_ruangan = ru.id LEFT JOIN lantai l ON ru.id_lantai = l.id WHERE m.status_data = 'Hapus' ORDER BY m.dihapus_pada DESC LIMIT ? OFFSET ?`, [limit, offset])
            return rows
        } catch (err) {
            throw err
        }
    }

    // mengupdate status data
    static async updateStatusData(data, id) {
        try {
            const [results] = await connection.query(`UPDATE majalah SET ? WHERE id = ?`, [data, id])
            return results
        } catch (err) {
            throw err
        }
    }

    static async searchJudulMajalah(judul) {
        try {
            const [rows] = await connection.query(`SELECT m.id, m.judul, m.foto_cover, m.edisi, m.no_klasifikasi, CONCAT(r.kode_rak, ' - ', ru.kode_ruangan, ' - ', l.kode_lantai) AS lokasi_majalah FROM majalah m LEFT JOIN rak r ON m.id_rak = r.id LEFT JOIN ruangan ru ON r.id_ruangan = ru.id LEFT JOIN lantai l ON ru.id_lantai = l.id WHERE m.status_data = 'Tampil' AND m.judul LIKE CONCAT('%', ?, '%')`, [judul])
            return rows
        } catch (err) {
            throw err
        }
    }

    static async searchJudulMajalahHapus(judul) {
        try {
            const [rows] = await connection.query(`SELECT m.id, m.judul, m.foto_cover, m.edisi, m.no_klasifikasi, CONCAT(r.kode_rak, ' - ', ru.kode_ruangan, ' - ', l.kode_lantai) AS lokasi_majalah FROM majalah m LEFT JOIN rak r ON m.id_rak = r.id LEFT JOIN ruangan ru ON r.id_ruangan = ru.id LEFT JOIN lantai l ON ru.id_lantai = l.id WHERE m.status_data = 'Hapus' AND m.judul LIKE CONCAT('%', ?, '%')`, [judul])
            return rows
        } catch (err) {
            throw err
        }
    }

    static async getByIdHapus(id) {
        try {
            const [rows] = await connection.query(`SELECT m.id, m.judul, m.foto_cover, m.edisi, m.no_klasifikasi, CONCAT(r.kode_rak, ' - ', ru.kode_ruangan, ' - ', l.kode_lantai) AS lokasi_majalah FROM majalah m LEFT JOIN rak r ON m.id_rak = r.id LEFT JOIN ruangan ru ON r.id_ruangan = ru.id LEFT JOIN lantai l ON ru.id_lantai = l.id WHERE m.status_data = 'Hapus' AND m.id = ?`, [id])
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    // mengambil foto_cover dengan status data tampil berdasarakan id
    static async getCoverById(id) {
        try {
            const [rows] = await connection.query(`SELECT m.id, m.foto_cover FROM majalah m WHERE m.status_data = 'Tampil' AND m.id = ?`,[id])
            return rows[0]
        } catch (err) {
            throw err
        }
    }

    // mengambil foto_cover dengan status data hapus berdasarakan id
    static async getCoverByIdHapus(id) {
        try {
            const [rows] = await connection.query(`SELECT m.id, m.foto_cover FROM majalah m WHERE m.status_data = 'Hapus' AND m.id = ?`,[id])
            return rows[0]
        } catch (err) {
            throw err
        }
    }
}

module.exports = Majalah
