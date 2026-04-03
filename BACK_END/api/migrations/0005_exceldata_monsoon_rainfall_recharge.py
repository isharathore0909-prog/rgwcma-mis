# Generated migration for adding monsoon rainfall and recharge fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_specificyield'),
    ]

    operations = [
        migrations.AddField(
            model_name='exceldata',
            name='monsoon_rainfall_mm',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='exceldata',
            name='recharge_ham',
            field=models.FloatField(blank=True, null=True),
        ),
    ]
