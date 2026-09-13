import pytest
from httpx import AsyncClient
import io

@pytest.mark.asyncio
async def test_list_prospects(client: AsyncClient):
    res = await client.get('/api/v1/prospects')
    assert res.status_code == 200
    assert isinstance(res.json(), list)

@pytest.mark.asyncio
async def test_create_prospect(client: AsyncClient):
    payload = {
        'email': 'sarah.connor@cyberdyne.com',
        'first_name': 'Sarah',
        'last_name': 'Connor',
        'company': 'Cyberdyne Systems',
        'website': 'https://cyberdyne.com',
        'title': 'Security Director'
    }
    res = await client.post('/api/v1/prospects', json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data['email'] == payload['email']
    assert data['first_name'] == 'Sarah'
    assert 'id' in data

@pytest.mark.asyncio
async def test_create_duplicate_prospect_fails(client: AsyncClient):
    payload = {
        'email': 'sarah.connor@cyberdyne.com',
        'first_name': 'Sarah',
        'company': 'Cyberdyne Systems'
    }
    res = await client.post('/api/v1/prospects', json=payload)
    assert res.status_code == 400
    assert 'already exists' in res.json()['detail']

@pytest.mark.asyncio
async def test_bulk_create_prospects(client: AsyncClient):
    payload = {
        'prospects': [
            {'email': 'john.doe@bulk1.com', 'first_name': 'John', 'company': 'Bulk1 Corp'},
            {'email': 'jane.doe@bulk2.com', 'first_name': 'Jane', 'company': 'Bulk2 Inc'}
        ]
    }
    res = await client.post('/api/v1/prospects/bulk', json=payload)
    assert res.status_code == 200
    created = res.json()
    assert len(created) == 2

@pytest.mark.asyncio
async def test_upload_csv_prospects(client: AsyncClient):
    csv_content = 'email,first_name,last_name,company,website,title\nelon@spacex.com,Elon,Musk,SpaceX,https://spacex.com,Chief Engineer\nsatya@microsoft.com,Satya,Nadella,Microsoft,https://microsoft.com,CEO\n'
    files = {'file': ('prospects.csv', io.BytesIO(csv_content.encode('utf-8')), 'text/csv')}
    res = await client.post('/api/v1/prospects/upload-csv', files=files)
    assert res.status_code == 200
    data = res.json()
    assert data['count'] == 2
