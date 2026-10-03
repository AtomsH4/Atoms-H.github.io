---
title: "AcWing - 电路维修"
summary: "把电路旋转建模为零一边权最短路，使用双端队列 BFS，并梳理点与方格坐标的区别。"
pubDate: "2021-07-07T08:43:00+08:00"
tags: ["0-1 BFS","最短路","AcWing"]
featured: false
draft: false
---

> 原文发表于 <time datetime="2021-07-07T08:43:00+08:00">2021-07-07 08:43（北京时间）</time> · [博客园原文](https://www.cnblogs.com/atomsh/p/14979862.html)。本文保留原文内容与代码，仅整理排版。

原题： [AcWing 175. 电路维修 - AcWing](https://www.acwing.com/activity/content/problem/content/1476/1/)

题意：给你一个图，由/和\\构成，你可以旋转其中的一格，使其从一种状态变为另一种状态，问如何旋转最少的次数，使可以从左上角点沿着路径走到右下角点，输出该次数。

分析：双端队列

将题目转换成，一个地图，对于顺着原有路径的边，边权为0，对于垂直于原有路径的边，边权为1，求解从左上角(0,0)点走到右下角(n,m)的最短路径。 考虑边权只有1和0两种可能，可以用bfs+双端队列实现。因为0边权可以是路径更小，因此前端推入0边，后端推入1边。

题解：

```cpp
#include<bits/stdc++.h>
#define ll long long
#define PII pair<int,int>
using namespace std;
const int N=505;
char g[N][N];
int n,m;
int dis[N][N];//记录从0,0点到该点的最短距离

//由于既考虑点坐标又考虑方格坐标，因此有两种偏移量
//坐标都要按照一种顺序设定，在此假设左上1，右上2，右下3，左下4，顺时针顺序
int x1[4]={-1,-1,1,1};
int yy[4]={-1,1,1,-1};
//由于第一个点坐标和第一个方格坐标都是(0,0)，所以方格的坐标根据其左上坐标点确定
//由此可以推测方格的偏移量
int x2[4]={-1,-1,0,0};
int y2[4]={-1,0,0,-1};

int bfs()
{
    char mo[]="\\/\\/";//一个点四个方向都可以走时的依次方向，实际上是\/\/
    deque<PII> dq;
    dq.push_front({0,0});
    dis[0][0]=0;

    while(dq.size())
    {
        auto t=dq.front();
        dq.pop_front();

        int x=t.first,y=t.second;
        for(int i=0;i<4;i++)
        {
            //注意这里的nx,ny是点的坐标
            int nx=x+x1[i];
            int ny=y+yy[i];

            if(nx<0||nx>n||ny<0||ny>m) continue;

            //判断给出的方向是顺着的还是垂直的
            int wei=0;
            //这里的nxx,nyy是方格的坐标
            int nxx=x+x2[i];
            int nyy=y+y2[i];
            if(g[nxx][nyy]!=mo[i]) wei=1;//垂直需要改变边的方向
            else wei=0;

            //更新最短路
            if(dis[nx][ny]>dis[x][y]+wei)
            {
                dis[nx][ny]=dis[x][y]+wei;
                if(wei) dq.push_back({nx,ny});
                else dq.push_front({nx,ny});
            }
        }

    }

    if(dis[n][m]==0x3f3f3f3f) return -1;
    else return dis[n][m];
}

int main()
{
    int T;
    cin>>T;
    while(T--)
    {
        cin>>n>>m;

        for(int i=0;i<n;i++)
        {
            for(int j=0;j<m;j++)
            {
                cin>>g[i][j];
            }
        }

        memset(dis,0x3f,sizeof dis);

        int tmp=bfs();
        if(tmp==-1) cout<<"NO SOLUTION"<<endl;
        else cout<<tmp<<endl;
    }

    return 0;
}
```

以上代码参考yxc老师的部分代码，yxcyyds！
