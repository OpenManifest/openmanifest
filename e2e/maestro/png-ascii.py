"""Draws a PNG as text (40 x 60 cells, ten shades, darkest as @) and lists its most common colours. Only for diagnosing the emulator's screen."""
import collections, struct, sys, zlib

data = open(sys.argv[1], 'rb').read()
pos, idat, width, height, depth, ctype = 8, b'', 0, 0, 8, 6
while pos < len(data):
    length, kind = struct.unpack('>I4s', data[pos:pos + 8])
    body = data[pos + 8:pos + 8 + length]
    if kind == b'IHDR':
        width, height, depth, ctype = struct.unpack('>IIBB', body[:10])
    elif kind == b'IDAT':
        idat += body
    pos += 12 + length
channels = {2: 3, 6: 4, 0: 1, 4: 2}[ctype]
raw = zlib.decompress(idat)
stride = width * channels
rows, prev = [], bytearray(stride)
for y in range(height):
    start = y * (stride + 1)
    kind, line = raw[start], bytearray(raw[start + 1:start + 1 + stride])
    for i in range(stride):
        a = line[i - channels] if i >= channels else 0
        b, c = prev[i], (prev[i - channels] if i >= channels else 0)
        if kind == 1: line[i] = (line[i] + a) & 255
        elif kind == 2: line[i] = (line[i] + b) & 255
        elif kind == 3: line[i] = (line[i] + (a + b) // 2) & 255
        elif kind == 4:
            p = a + b - c
            pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
            line[i] = (line[i] + (a if pa <= pb and pa <= pc else b if pb <= pc else c)) & 255
    rows.append(line)
    prev = line
colours = collections.Counter()
for y in range(0, height, 8):
    for x in range(0, width, 8):
        colours[tuple(rows[y][x * channels:x * channels + 3])] += 1
print('size', width, height, 'colours', colours.most_common(6))
cols, cells = 40, 60
for cy in range(cells):
    out = ''
    for cx in range(cols):
        y, x = cy * height // cells, cx * width // cols
        r, g, b = rows[y][x * channels:x * channels + 3]
        out += ' .:-=+*#%@'[min(9, (255 - (r * 30 + g * 59 + b * 11) // 100) * 10 // 256)]
    print('|' + out + '|')
