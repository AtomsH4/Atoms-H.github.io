---
title: "洛谷 - P1107 [BJWC2008]雷涛的小猫"
summary: "从跨树跳跃的动态规划出发，用每层最优值消除树之间的重复枚举。"
pubDate: "2022-04-02T15:24:00+08:00"
tags: ["动态规划","状态优化","洛谷"]
featured: false
draft: false
---

> 原文发表于 <time datetime="2022-04-02T15:24:00+08:00">2022-04-02 15:24（北京时间）</time> · [博客园原文](https://www.cnblogs.com/atomsh/p/16092308.html)。本文保留原文内容与代码，仅整理排版。

> **整理勘误：** 代码中的 height[i] 记录的是高度 i 处可获得的最大柿子数，不是“最大高度”。缓存每层最优值后，动态规划的时间复杂度为 O(h × n)。 原始代码保留如下。

原题：[https://www.luogu.com.cn/problem/P1107](https://www.luogu.com.cn/problem/P1107)

题意：给你n棵树，树的高度为h，树上有柿子，告诉你每棵树的哪些高度上有柿子。现在让你从任意一棵树的最高处开始往下走，如果在同一颗树上往下跳1单位距离，如果要去往别的树要往下跳delta的单位距离。问怎样走能吃到（经过）最多的柿子，输出总共的数量。

分析：动态规划。看题目很容易知道是状态转移，如果要到第i颗树的j高度上，那么有两种转移过来的方式，第i颗树的j+1位置或者另外第k棵树的第j+delta位置，由此可以列出转移方程。

但是如果枚举这个k，时间复杂度为h\*n^2，是不行滴，需要进一步优化。因为在处理完一层高度后到达该高度的最大柿子数量不会改变，于是再开一个数组记录每个高度对应的最大柿子数量，这样就可以省去对k的遍历，直接用j+delta高度下的最大值即可，具体看注释。

题解：

```cpp
#include <bits/stdc++.h>
#define ll long long
using namespace std;
const int N=2005;
const ll mod=1e6+7;
int num[N],a[N][N];
ll height[N];//优化：处理出高度为i时对应的最大高度
ll dp[N][N];//dp[i][j]表示跳到第i棵树上，且高度为j时能吃到的最多柿子个数
//最终结果为dp[i][0]

int main()
{
    int n,h,delta;
    scanf("%d%d%d",&n,&h,&delta);

    for(int i=1;i<=n;i++)
    {
        scanf("%d",&num[i]);
        for(int j=1;j<=num[i];j++)
        {
            int tmp;
            scanf("%d",&tmp);
            a[i][tmp]++;
        }
    }

    //有两种转移方式，从这棵树的上面往下跳一格dp[i][j+1]
    //或者从另一棵树上跳下delta，max(dp[k][j+delta])
    for(int i=h;i>=0;i--)
    {
        for(int j=1;j<=n;j++)
        {
            dp[j][i]=dp[j][i+1]+a[j][i];
            ll maxx=0;
            if(i+delta<=h)//从h高度开始，不能从超过h的位置往下跳
            {
                dp[j][i]=max(height[i+delta]+a[j][i],dp[j][i]);
            }
            height[i]=max(height[i],dp[j][i]);//更新高度i的最大值
        }
    }

    ll ans=0;
    for(int i=1;i<=n;i++)
    {
        ans=max(ans,dp[i][0]);
    }

    printf("%lld",ans);
    return 0;
}
```

💻 Bye~
