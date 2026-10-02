---
title: "Acwing - 蒙德里安的梦想"
summary: "用二进制表示棋盘覆盖状态，预处理合法状态与相容关系，再进行逐列动态规划。"
pubDate: "2021-08-02T00:32:00+08:00"
tags: ["状态压缩","动态规划","AcWing"]
featured: false
draft: false
---

> 原文发表于 <time datetime="2021-08-02T00:32:00+08:00">2021-08-02 00:32（北京时间）</time> · [博客园原文](https://www.cnblogs.com/atomsh/p/15088209.html)。本文保留原文内容与代码，仅整理排版。

原题：[291. 蒙德里安的梦想 - AcWing题库](https://www.acwing.com/problem/content/293/)

题意：求把N×M的棋盘分割成若干个1×2的的长方形，有多少种方案。

分析：状压dp，具体看代码注解。

题解：

```cpp
//状压dp：棋盘式
//二进制记录状态
//结论：总方案数=只考虑横着放的方案数（考虑完横着放后，把竖的填进去就完事了）
//根据上述结论，可以知道满足情况的条件1：未填的竖着的连通块数必须为偶数
//状态数组f[i][j]记录的是前i-1列状态不变，第i-1列延伸至第i列，致使第i列状态为j的方案个数
//条件2：在填的过程中，当前列与前一列不能在某一行重合，即满足两列状态的与为0
//状态转移方程f[i][j]=f[i][j]+f[i-1][k] k为可以填入该列的合法状态

#include <bits/stdc++.h>
#define ll long long
using namespace std;
const int N=12,M=1<<N;
int n,m;
ll f[N][M];
bool con1[M];
vector<int> val[M];

int main()
{
    while(cin>>n>>m,n||m)
    {
        //预处理条件1
        for(int i=0;i<1<<n;i++)//遍历每一种状态
        {
            int cnt=0;//记录竖着的连通格数
            bool check=true;//该状态是否合法
            //判断每一位
            for(int j=0;j<n;j++)
            {
                if(i>>j&1)//非连通部分，判断
                {
                    if(cnt%2!=0)//奇数时不合法
                    {
                        check=false;
                        break;
                    }
                    cnt=0;//重新计数
                }
                else//连通部分
                {
                    cnt++;
                }
            }
            if(cnt%2!=0) check=false;//别忘了最后一次的判断
            con1[i]=check;//con1记录状态i是否符合条件1
        }
        //在满足条件1的基础上，预处理条件2
        //枚举所有的两种状态
        for(int i=0;i<1<<n;i++)
        {
            val[i].clear();//val存储能使状态i符合条件的状态
            for(int j=0;j<1<<n;j++)
            {
                if((i&j)==0&&con1[i|j])//满足条件1+条件2
                {
                    val[i].push_back(j);
                }
            }
        }

        //状态预处理
        memset(f,0,sizeof f);
        f[0][0]=1;//致使第0列状态是0的方案数是1，因为前面什么都没有，所以只有一种可能，就是它本身的状态
        //状态转移
        for(int i=1;i<=m;i++)
        {
            //因为要判断的是前m列不动后，第m+1列啥也没有（0状态），即全部填完的方案数
            //所以要从第0列开始，遍历到m，实际上是算了m+1列
            for(int j=0;j<1<<n;j++)//每一种状态
            {
                for(auto k:val[j])//合法
                {
                    f[i][j]+=f[i-1][k];
                }
            }
        }
        cout<<f[m][0]<<endl;
    }
}
```

以上代码参考yxc老师的题解代码，yxcyyds！
