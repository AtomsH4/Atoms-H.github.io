---
title: "Acwing - 方格取数"
summary: "将两次取数建模为同步行走，通过坐标和降维，并处理路径重合时的重复计数。"
pubDate: "2022-02-10T16:28:00+08:00"
tags: ["动态规划","多路径问题","AcWing"]
featured: false
draft: false
---

> 原文发表于 <time datetime="2022-02-10T16:28:00+08:00">2022-02-10 16:28（北京时间）</time> · [博客园原文](https://www.cnblogs.com/atomsh/p/15879729.html)。本文保留原文内容与代码，仅整理排版。

> **整理勘误：** 原文与代码注释中的 k 是当前位置的行列坐标之和，不是实际移动次数。采用从 1 开始的坐标时，终点坐标和为 2n，而从起点到终点实际移动 2n − 2 步；状态转移逻辑不变。 原始代码保留如下。

原题：[https://www.acwing.com/problem/content/1029/](https://www.acwing.com/problem/content/1029/)

题意：N\*N的方格图，给你几个含有值的坐标，求两次从方格图左上角走到右下角途经的方格数最大和（只能往右和下走第一次走过的方格中值置零）。

分析：动态规划状态转移，由于只能往右和下走，所以两次走的步数一定都是2\*n。需要注意的是，如果先走第一次，中间置0，再走第二次，不能保证最终结果是最大，所以要同步走。可以利用四维数组分别记录两次的坐标进行转移，此处进行了优化，利用三维数组，第一维记录当前走的步数，后两维分别记录两次的横坐标，则纵坐标=步数-横坐标。每一步可以由四种情况转移而来，求取最大值即可。

题解：

```cpp
#include <bits/stdc++.h>
using namespace std;
const int N=15;
const int INF=1e9+7;
int g[N][N];
int f[2*N][N][N]; //f[k][i][j]表示当两次都走k步时，一次走到(i,k-i)，另一次走到(j,k-j)的最大和

int main()
{
    int n;
    scanf("%d", &n);
    while(1)
    {
        int a,b,c;
        scanf("%d%d%d", &a, &b, &c);
        if(!a && !b && !c) break;
        g[a][b] = c;
    }

    for(int k=1;k<=2*n;k++)
    {
        for(int i1=1;i1<=n;i1++)
        {
            for(int i2=1;i2<=n;i2++)
            {
                int j1 = k-i1,j2 = k-i2;
                if(j1>=1 && j1<=n && j2>=1 && j2<=n) //不能越界
                {
                    int &x = f[k][i1][i2]; //&表示引用，起标识作用，当对x进行改值时会修改数组中的值
                    int t = g[i1][j1];
                    if(i1 != i2) t += g[i2][j2]; //如果两个点不重合，则再加(i2,j2)
                    //取四个状态中转移过来最大的值
                    x = max(x,f[k-1][i1-1][i2-1]+t);
                    x = max(x,f[k-1][i1-1][i2]+t);
                    x = max(x,f[k-1][i1][i2-1]+t);
                    x = max(x,f[k-1][i1][i2]+t);
                }
            }
        }
    }

    printf("%d", f[n*2][n][n]);
    return 0;
}
```

以上代码参考yxc老师的题解代码，yxcyyds！
