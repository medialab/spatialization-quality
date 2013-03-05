# -*- coding: utf-8 -*-
# pip install networkx
# examples to write GEXF : https://github.com/medialab/Hypertext-Corpus-Initiative/blob/master/lib/gexf.py

import networkx as nx


def run(sourceFile, targetFile) :
        M, nodes, hashnodes = readGEXFintoMatrix(sourceFile)
        C = mesure(M, 10)
        saveMatrixintoGEXF(C, nodes, hashnodes, targetFile)
        print("OK")

def readGEXFintoMatrix(path) :
    from cStringIO import StringIO
    sio = StringIO()
    for line in open(path):
        if "<viz:color" not in line:
            print >>sio, line
    sio.seek(0)
    G = nx.read_gexf(sio)
    hashnodes = {}
    nodes = [(0, {}) for i in G.nodes()]
    for i, (nid, data) in enumerate(G.nodes(data=True)):
        hashnodes[nid] = i
        nodes[i] = (nid, data)
    M = zeros(len(nodes))
    for (aid, bid, w) in G.edges_iter(data=True):
        a = hashnodes[aid]
        b = hashnodes[bid]
        M[a][b] = 1 #w['weight']
        M[b][a] = 1 #w['weight']
    return (M, nodes, hashnodes)
  
def saveMatrixintoGEXF(M, nodes, hashnodes, path) :
	G2 = nx.DiGraph()
	for i, (nid, data) in enumerate(nodes):
		G2.add_node(nid, data)
	for isource, (nsourceid, datasource) in enumerate(nodes):
		for itarget, (ntargetid, datatarget) in enumerate(nodes):
			a = hashnodes[nsourceid]
			b = hashnodes[ntargetid]
			G2.add_edge(nsourceid, ntargetid, weight=M[a][b])
	nx.write_gexf(G2, path)
    
    

def lignes(M) :					#Nombres de lignes
	return range(len(M))
	
def cols(M) : 					#Nombre de colonnes
	return range(len(M[0]))
	
def transpose(M) : 				#Transposee de la matrice
	return [[M[i][j] for i in lignes(M)] for j in cols(M) ]
	
def msom(A,B) :					#Somme de deux matrices
	if lignes(A) != lignes(B) or cols(A) != cols(B) :
		return "Pas cool"
	else :
		return [[A[i][j]+B[i][j] for j in cols(A)] for i in lignes(A)]

def mscal(M,k) :				#Produit par un scalaire
	return[[k * M[i][j] for j in cols(M)] for i in lignes(M)]
	
def mprod(A,B) :				#Produit de deux matrices
	if cols(A) != lignes(B) :
		return "Pas cool"
	else:
		C=[[0 for p in cols(B)] for p in lignes(A)]
		for i in lignes(A) :
			Ai,Ci = A[i],C[i]
			for j in cols(B) :
				for k in lignes(B) :
					Ci[j]+=Ai[k]*B[k][j]
	return C

def unite(n) :					#Creation de la matrice identite
	return [[1 if i==j else 0 for j in range(n)] for i in range(n)]

def mpuis(A,n) :				#Puissance de la matrice
	if n==0: return unite(len(A))
	else : return mprod(A,mpuis(A,n-1))

def inv(M) :					#Presque-Inverse terme à terme
	return [[1/(M[i][j]+1) for j in cols(M)] for i in lignes(M)]
	
def mesure(M,prec) :			#Calcul de la mesure jusqu'au rang Prec
	C =unite(len(M))
	for i in range(prec) :
		C= msom(C,mscal(mpuis(M,i+1),(len(M)-1) ** (1-i)))
	return C	
	
def affiche(M) : 				#Affichage plus sympa des matrices
	for j in cols(M) :
		print(M[j])

def zeros(n) :					#Crée une matrice avec des zéros
	return[[0 for j in range(n)] for i in range(n)]

def adj(n) :					#Crée une matrice d'adjacence
	M=zeros(n)
	print("")
	for i in range(n) :
		for j in range(i+1,n) :
			print(i+1, "est connecté avec", j+1)
			M[i][j]= int(input("Oui(1) ou Non(0)"))
	return msom(M,transpose(M))
	
	
def union(A,B) :				#A définir et à refaire plus tard...#
	n=unite(lignes(A))
	M=zeros(n)
	if lignes(A) != lignes(B) : return "Pas cool"
	else : 
		M=zeros(n)
		for i in range(n) :
			for j in range(i+1,n) :
				M[i][j]=max(A[i][j],B[i][j])
	return M

if __name__ == "__main__":
    import sys
    run(sys.argv[1], sys.argv[2])
