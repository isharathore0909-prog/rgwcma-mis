from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_exceldata_monsoon_rainfall_recharge'),
    ]

    operations = [
        migrations.AddField(
            model_name='exceldata',
            name='recharge_2015',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='exceldata',
            name='recharge_2016',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='exceldata',
            name='recharge_2017',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='exceldata',
            name='recharge_2018',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='exceldata',
            name='recharge_2019',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='exceldata',
            name='recharge_2020',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='exceldata',
            name='recharge_2021',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='exceldata',
            name='recharge_2022',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='exceldata',
            name='recharge_2023',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='exceldata',
            name='recharge_2024',
            field=models.FloatField(blank=True, null=True),
        ),
    ]
