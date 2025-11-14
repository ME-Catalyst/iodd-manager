import sqlite3

conn = sqlite3.connect('iodd_manager.db')
c = conn.cursor()

c.execute('SELECT COUNT(*) FROM eds_assemblies')
print('Total assemblies:', c.fetchone()[0])

c.execute('SELECT eds_file_id, COUNT(*) FROM eds_assemblies GROUP BY eds_file_id')
print('\nAssemblies by EDS file:')
for r in c.fetchall():
    c2 = conn.cursor()
    c2.execute('SELECT product_name, vendor_code, product_code FROM eds_files WHERE id = ?', (r[0],))
    info = c2.fetchone()
    print(f'  EDS {r[0]}: {info[0] if info else "Unknown"} - {r[1]} assemblies')

c.execute('SELECT id, product_name FROM eds_files WHERE product_code = 56535 LIMIT 5')
print('\nEDS files for product 56535:')
for r in c.fetchall():
    print(f'  ID {r[0]}: {r[1]}')

conn.close()
