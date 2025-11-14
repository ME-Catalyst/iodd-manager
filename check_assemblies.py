import sqlite3

conn = sqlite3.connect('iodd_manager.db')
c = conn.cursor()

c.execute('SELECT eds_file_id, COUNT(*) FROM eds_assemblies GROUP BY eds_file_id LIMIT 5')
print('\nEDS files with assemblies:')
for r in c.fetchall():
    c2 = conn.cursor()
    c2.execute('SELECT id, product_name FROM eds_files WHERE id = ?', (r[0],))
    info = c2.fetchone()
    print(f'  ID {r[0]}: {info[1]} - {r[1]} assemblies')

conn.close()
