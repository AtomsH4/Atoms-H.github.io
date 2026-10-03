---
title: "LeetCode - 高频SQL50题（基础版）部分题解"
summary: "通过五道 SQL 题整理外连接、自连接、分组聚合、空值处理与子查询，并比较不同写法。"
pubDate: "2024-03-11T23:49:00+08:00"
tags: ["SQL","MySQL","LeetCode"]
featured: false
draft: false
---

> 原文发表于 <time datetime="2024-03-11T23:49:00+08:00">2024-03-11 23:49（北京时间）</time> · [博客园原文](https://www.cnblogs.com/atomsh/p/18067394)。本文保留原文内容与代码，仅整理排版。

> **整理勘误：** 本文示例使用 MySQL 语法。原文“GROUP BY 后面不用带表名”只描述该示例的写法；实际查询遇到同名列时，建议写明表别名以避免歧义。 原始代码保留如下。

## 1581. 进店却未进行过交易的顾客

原题：[https://leetcode.cn/problems/customer-who-visited-but-did-not-make-any-transactions/](https://leetcode.cn/problems/customer-who-visited-but-did-not-make-any-transactions/)

题意：有一些顾客可能光顾了购物中心但没有进行交易。请你编写一个解决方案，来查找这些顾客的 ID （customer\_id），以及他们只光顾不交易的次数（count\_no\_trans）。

分析：customer\_id来自Visit表，count\_no\_trans涉及两个表，需要将Visits表与Transactions表连接起来，因为要保留左边表的悬浮元组（左表有右表没有的元组），所以使用左外连接。然后用COUNT函数，统计在Visits表中有，但是Transactions表中没有的元组数量，并用GROUP BY函数按照用户id分类。

题解：

```sql
select v.customer_id, count(*) as count_no_trans
from Visits as v
left join Transactions as t
on v.visit_id = t.visit_id
where t.transaction_id is null
group by v.customer_id;
```

## 197. 上升的温度

原题：[https://leetcode.cn/problems/rising-temperature/](https://leetcode.cn/problems/rising-temperature/)

题意：编写解决方案，找出与之前（昨天的）日期相比温度更高的所有日期的id。

分析：由于涉及昨天和今天温度的比较，需要将Weather表自身连接。为了判断昨天，用datediff函数计算两天之间的差值，datediff(a,b)=-1表示a是b的前一天，最后判断温度高低。

题解：

```sql
select today.id
from Weather as yestday
left join Weather as today
on datediff(yestday.recordDate,today.recordDate)=-1
where today.Temperature > yestday.Temperature;
```

## 1661. 每台机器的进程平均运行时间

原题：[https://leetcode.cn/problems/average-time-of-process-per-machine/](https://leetcode.cn/problems/average-time-of-process-per-machine/)

题意：现在有一个工厂网站由几台机器运行，每台机器上运行着相同数量的进程。编写解决方案，计算每台机器各自完成一个进程任务的平均耗时。

完成一个进程任务的时间指进程的`'end' 时间戳` 减去 `'start' 时间戳`。平均耗时通过计算每台机器上所有进程任务的总耗费时间除以机器上的总进程数量获得。

结果表必须包含`machine_id（机器ID）` 和对应的 average time（平均耗时） 别名 `processing_time`，且四舍五入保留3位小数。

分析：由于需要用end时间戳-start时间戳，需要将Activity表自身连接，并用machine\_id进行分组。运用avg函数计算平均耗时，round函数四舍五入，并记为processing\_time。

题解：

```sql
select a.machine_id, round(avg(b.timestamp-a.timestamp),3) as processing_time
from Activity as a
left join Activity as b
on a.machine_id = b.machine_id and a.process_id = b.process_id
where a.activity_type = 'start' and b.activity_type = 'end'
group by machine_id;
```

## 1280. 学生们参加各科测试的次数

原题：[https://leetcode.cn/problems/students-and-examinations/](https://leetcode.cn/problems/students-and-examinations/)

题意：查询出每个学生参加每一门科目测试的次数，结果按 `student_id` 和 `subject_name` 排序。

分析：为了得到学生和科目的全部组合，需要先将Students表和Subjects表交叉联接，然后与Examinations表建立左外连接，按照学生名和课程名分组，统计参加考试次数，然后按照题意排序。

注意count函数中填入subject\_name，这样当学生没有参加过考试时，数量记为0。

题解：

```sql
#法一
select stu.student_id, stu.student_name, sub.subject_name, count(exam.subject_name) as attended_exams
from Students as stu
cross join Subjects as sub
left join Examinations as exam
on stu.student_id = exam.student_id and sub.subject_name = exam.subject_name
group by student_id, subject_name #注意group by后面不用带表名
order by stu.student_id, sub.subject_name;
```

分析：对于嵌套查询，将问题拆开，先写子查询比较容易。

子查询解决的是分组的问题，统计每个学生参加每个科目的考试次数。

父查询主要解决的是连接和排序的问题，为了得到学生和科目的全部组合，需要先将Students表和Subjects表交叉联接，然后与子查询得到的考试次数左外连接，然后按照题意排序。

注意别忘了没有参加考试的count结果为null，因此需要用ifnull函数，让null变为0。

题解：

```sql
#法二
#子查询
select student_id, subject_name, count(*) as attended_exams
from Examinations
group by student_id, subject_name
#查询
select stu.student_id, stu.student_name, sub.subject_name, ifnull(grouped.attended_exams, 0) as attended_exams
from Students as stu
cross join Subjects sub
left join (
    select student_id, subject_name, count(*) as attended_exams
    from Examinations
    group by student_id, subject_name
) grouped
on stu.student_id = grouped.student_id and sub.subject_name = grouped.subject_name
order by stu.student_id, sub.subject_name;
```

## 1251. 平均售价

原题：[https://leetcode.cn/problems/average-selling-price/](https://leetcode.cn/problems/average-selling-price/)

题意：编写解决方案以查找每种产品的平均售价。`average_price` 应该 四舍五入到小数点后两位。

分析：average\_price = price\*units之和/units之和，所以需要分别求出sum\_price和sum\_units。分为两层查询，子查询处理sum\_price，计算对应的price与units的乘积需要使用between...and函数判断日期是否在规定日期内。父查询处理sum\_units，按照product\_id分组后直接由sum函数求得，最后相除并四舍五入。注意用ifnull函数排除商品没有被卖出过的情况。

题解：

```sql
select product_id, ifnull(round(sum(s.sales)/sum(s.units),2),0) as average_price
from (
    select p.product_id as product_id, units, p.price*u.units as sales
    from Prices as p
    left join UnitsSold as u
    on p.product_id = u.product_id
    and (u.purchase_date between p.start_date and p.end_date)
) s
group by product_id
```
