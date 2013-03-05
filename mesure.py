# -*- coding: utf-8 -*-
# pip install networkx
# examples to write GEXF : https://github.com/medialab/Hypertext-Corpus-Initiative/blob/master/lib/gexf.py

import networkx as nx
import numpy as np
import numpy.matlib as npm

def run(sourceFile, targetFile):
        M, nodes, hashnodes = readGEXFintoMatrix(sourceFile)
        C = mesure(M, 10)
        saveMatrixintoGEXF(C.tolist(), nodes, hashnodes, targetFile)
        print("OK")

def readGEXFintoMatrix(path):
    from cStringIO import StringIO
    sio = StringIO()

    for line in open(path):
        if "<viz:color" not in line:
            print >>sio, line
    sio.seek(0)

    G = nx.read_gexf(sio)
    hashnodes = {}
    nodes = [(0, {}) for _ in G.nodes()]

    for i, (nid, data) in enumerate(G.nodes(data=True)):
        hashnodes[nid] = i
        nodes[i] = (nid, data)

    ln = len(nodes)
    M = npm.zeros((ln, ln))

    for (aid, bid, w) in G.edges_iter(data=True):
        a = hashnodes[aid]
        b = hashnodes[bid]
        M[a,b] = 1 #w['weight']
        M[b,a] = 1 #w['weight']

    return (M, nodes, hashnodes)

def saveMatrixintoGEXF(M, nodes, hashnodes, path):
    G2 = nx.DiGraph()

    for i, (nid, data) in enumerate(nodes):
        G2.add_node(nid, data)

    for isource, (nsourceid, datasource) in enumerate(nodes):
        for itarget, (ntargetid, datatarget) in enumerate(nodes):
            a = hashnodes[nsourceid]
            b = hashnodes[ntargetid]
            G2.add_edge(nsourceid, ntargetid, weight=M[a][b])

    nx.write_gexf(G2, path)

def mesure(M,prec):            #Calcul de la mesure jusqu'au rang Prec
    C = npm.identity(len(M))

    for i in range(prec):
        x = (M ** (i+1)) * ((len(M)-1) ** (1-i))
        C = C + x

    return C

if __name__ == "__main__":
    import sys
    run(sys.argv[1], sys.argv[2])
